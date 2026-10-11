import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.interview import InterviewSession
from app.schemas.interview import (
    InterviewSessionCreate,
    InterviewSessionOut,
    InterviewAnswer,
)
from app.services.interview_ai import generate_question, generate_overall_feedback

router = APIRouter(prefix="/interviews", tags=["interviews"])


def _get_owned_session(session_id: int, db: Session, current_user: User) -> InterviewSession:
    session = db.get(InterviewSession, session_id)
    if not session or session.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return session


@router.post("/", response_model=InterviewSessionOut, status_code=201)
def start_interview(
    payload: InterviewSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = InterviewSession(role=payload.role, transcript="[]", owner_id=current_user.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/", response_model=list[InterviewSessionOut])
def list_interviews(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return db.query(InterviewSession).filter(InterviewSession.owner_id == current_user.id).all()


@router.get("/{session_id}/next-question")
def next_question(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = _get_owned_session(session_id, db, current_user)
    question = generate_question(session.role, session.transcript)
    return {"question": question}


@router.post("/{session_id}/answer", response_model=InterviewSessionOut)
def submit_answer(
    session_id: int,
    payload: InterviewAnswer,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = _get_owned_session(session_id, db, current_user)
    turns = json.loads(session.transcript)
    turns.append({"question": payload.question, "answer": payload.answer})
    session.transcript = json.dumps(turns)
    db.commit()
    db.refresh(session)
    return session


@router.post("/{session_id}/finish", response_model=InterviewSessionOut)
def finish_interview(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = _get_owned_session(session_id, db, current_user)
    feedback = generate_overall_feedback(session.role, session.transcript)
    session.overall_feedback = feedback
    db.commit()
    db.refresh(session)
    return session
