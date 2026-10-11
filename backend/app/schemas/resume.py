from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ResumeCreate(BaseModel):
    title: str
    content: str


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class ResumeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    ai_feedback: Optional[str]
    created_at: datetime
