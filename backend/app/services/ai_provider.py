
"""
Provider-agnostic AI layer.

Supports Anthropic, OpenAI, and Gemini.
"""

from abc import ABC, abstractmethod
from typing import List, Dict
from fastapi import HTTPException

from app.core.config import settings


class AIProvider(ABC):
    @abstractmethod
    def generate(self, system_prompt: str, messages: List[Dict[str, str]]) -> str:
        raise NotImplementedError


class AnthropicProvider(AIProvider):
    def __init__(self):
        import anthropic

        self.client = anthropic.Anthropic(
            api_key=settings.anthropic_api_key
        )

    def generate(self, system_prompt: str, messages: List[Dict[str, str]]) -> str:
        response = self.client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=system_prompt,
            messages=messages,
        )
        return "".join(
            block.text for block in response.content
            if block.type == "text"
        )


class OpenAIProvider(AIProvider):
    def __init__(self):
        from openai import OpenAI

        self.client = OpenAI(api_key=settings.openai_api_key)

    def generate(self, system_prompt: str, messages: List[Dict[str, str]]) -> str:
        full_messages = [
            {"role": "system", "content": system_prompt}
        ] + messages

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=full_messages,
            max_tokens=1024,
        )
        return response.choices[0].message.content


class GeminiProvider(AIProvider):
    def __init__(self):
        from google import genai

        self.client = genai.Client(
            api_key=settings.gemini_api_key
        )

    def generate(self, system_prompt: str, messages: List[Dict[str, str]]) -> str:
        contents = []

        for message in messages:
            contents.append({
                "role": "model" if message["role"] == "assistant" else "user",
                "parts": [{"text": message["content"]}],
            })

        response = self.client.models.generate_content(
            model="gemini-3.6-flash",
            contents=contents,
            config={
                "system_instruction": system_prompt,
                "max_output_tokens": 1024,
            },
        )

        return response.text


_provider_instance: AIProvider | None = None


def get_ai_provider() -> AIProvider:
    global _provider_instance

    if _provider_instance is None:
        if settings.ai_provider == "gemini":
            _provider_instance = GeminiProvider()
        elif settings.ai_provider == "openai":
            _provider_instance = OpenAIProvider()
        else:
            _provider_instance = AnthropicProvider()

    return _provider_instance


def generate_completion(system_prompt: str, messages: List[Dict[str, str]]) -> str:
    try:
        return get_ai_provider().generate(system_prompt, messages)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI error: {type(e).__name__}: {str(e)[:300]}")