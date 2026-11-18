from abc import ABC, abstractmethod
from typing import List, Dict
import time

from fastapi import HTTPException

from app.core.config import settings


class AIProvider(ABC):
    @abstractmethod
    def generate(self, system_prompt: str, messages: List[Dict[str, str]]) -> str:
        raise NotImplementedError


class AnthropicProvider(AIProvider):
    def __init__(self):
        import anthropic

        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    def generate(self, system_prompt, messages):
        response = self.client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=system_prompt,
            messages=messages,
        )
        return "".join(b.text for b in response.content if b.type == "text")


class OpenAIProvider(AIProvider):
    def __init__(self):
        from openai import OpenAI

        self.client = OpenAI(api_key=settings.openai_api_key)

    def generate(self, system_prompt, messages):
        full = [{"role": "system", "content": system_prompt}] + messages
        response = self.client.chat.completions.create(
            model="gpt-4o-mini", messages=full, max_tokens=1024
        )
        return response.choices[0].message.content



class GeminiProvider(AIProvider):
    def __init__(self):
        from google import genai

        self.client = genai.Client(api_key=settings.gemini_api_key)

    def generate(self, system_prompt, messages):
        from google.genai import types

        contents = [
            types.Content(
                role="user" if m["role"] == "user" else "model",
                parts=[types.Part.from_text(text=m["content"])],
            )
            for m in messages
        ]

        max_retries = 2

        start_time = time.time()
        for attempt in range(max_retries):
            try:
                response = self.client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        max_output_tokens=8192,
                    ),
                )
                break

            except Exception as e:
                error_message = str(e).upper()

                is_temporary_error = any(
                    error in error_message
                    for error in [
                        "503", "UNAVAILABLE", "429",
                        "RESOURCE_EXHAUSTED", "500", "502", "504"
                    ]
                )

                if not is_temporary_error or attempt == max_retries - 1:
                    raise

                wait_time = 1
                print(
                    f"Gemini temporarily unavailable. "
                    f"Retrying in {wait_time} seconds..."
                )
                time.sleep(wait_time)

        if not response.text:
            raise ValueError("Gemini returned an empty response.")
        
        print(f"Gemini response completed in {time.time() - start_time:.2f} seconds")
        return response.text



_provider_instance = None


def get_ai_provider() -> AIProvider:
    global _provider_instance
    if _provider_instance is None:
        if settings.ai_provider == "openai":
            _provider_instance = OpenAIProvider()
        elif settings.ai_provider == "gemini":
            _provider_instance = GeminiProvider()
        else:
            _provider_instance = AnthropicProvider()
    return _provider_instance


def generate_completion(system_prompt: str, messages: List[Dict[str, str]]) -> str:
    try:
        return get_ai_provider().generate(system_prompt, messages)
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI error: {type(e).__name__}: {str(e)[:300]}",
        )