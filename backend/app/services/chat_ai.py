from typing import List, Dict
from app.services.ai_provider import generate_completion

SYSTEM_PROMPT = """You are a friendly, knowledgeable career advisor chatbot.
Help users with job search strategy, career transitions, salary negotiation,
skill development, and general professional advice. Keep answers concise
and actionable."""


def get_chat_reply(history: List[Dict[str, str]]) -> str:
    """history: list of {"role": "user"|"assistant", "content": str}, most recent last."""
    return generate_completion(system_prompt=SYSTEM_PROMPT, messages=history)
