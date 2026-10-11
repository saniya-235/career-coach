from app.services.ai_provider import generate_completion

SYSTEM_PROMPT = """You are an expert technical recruiter and resume coach.
Given a resume's text, provide constructive, specific feedback:
1. Overall impression (2-3 sentences)
2. Top 3 strengths
3. Top 3 areas to improve, with concrete rewrite suggestions
4. ATS (Applicant Tracking System) compatibility notes
Keep the response well-organized with headers. Be direct but encouraging."""


def review_resume(resume_text: str) -> str:
    return generate_completion(
        system_prompt=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": resume_text}],
    )
