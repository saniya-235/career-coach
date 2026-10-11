from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class InterviewSessionCreate(BaseModel):
    role: str


class InterviewAnswer(BaseModel):
    question: str
    answer: str


class InterviewSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    transcript: str
    overall_feedback: Optional[str]
    created_at: datetime
