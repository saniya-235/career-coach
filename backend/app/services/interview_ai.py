import json
from app.services.ai_provider import generate_completion

QUESTION_SYSTEM_PROMPT = """You are an experienced technical interviewer conducting
a mock interview for the role: {role}.
Ask exactly one relevant interview question. Do not include any preamble,
numbering, or extra commentary — output only the question itself."""

FEEDBACK_SYSTEM_PROMPT = """You are an experienced interview coach reviewing a mock
interview transcript for the role: {role}.
The transcript is a JSON list of {{"question": ..., "answer": ...}} objects.
Give overall feedback covering:
1. Communication clarity
2. Technical/role-relevant depth
3. Specific answers that could be stronger, with suggested improvements
4. A rough readiness score out of 10
Be constructive and specific."""


def generate_question(role: str, previous_transcript: str) -> str:
    system_prompt = QUESTION_SYSTEM_PROMPT.format(role=role)
    history = json.loads(previous_transcript) if previous_transcript else []
    context = (
        f"Previous Q&A so far: {json.dumps(history)}"
        if history
        else "This is the first question of the interview."
    )
    return generate_completion(
        system_prompt=system_prompt,
        messages=[{"role": "user", "content": context}],
    )


def generate_overall_feedback(role: str, transcript: str) -> str:
    system_prompt = FEEDBACK_SYSTEM_PROMPT.format(role=role)
    return generate_completion(
        system_prompt=system_prompt,
        messages=[{"role": "user", "content": transcript}],
    )
