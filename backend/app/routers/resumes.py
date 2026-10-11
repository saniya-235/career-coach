from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeCreate, ResumeUpdate, ResumeOut
from app.services.resume_ai import review_resume

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.post("/", response_model=ResumeOut, status_code=201)
def create_resume(
    payload: ResumeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = Resume(title=payload.title, content=payload.content, owner_id=current_user.id)
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.get("/", response_model=list[ResumeOut])
def list_resumes(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return db.query(Resume).filter(Resume.owner_id == current_user.id).all()


def _get_owned_resume(resume_id: int, db: Session, current_user: User) -> Resume:
    resume = db.get(Resume, resume_id)
    if not resume or resume.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_owned_resume(resume_id, db, current_user)


@router.put("/{resume_id}", response_model=ResumeOut)
def update_resume(
    resume_id: int,
    payload: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = _get_owned_resume(resume_id, db, current_user)
    if payload.title is not None:
        resume.title = payload.title
    if payload.content is not None:
        resume.content = payload.content
    db.commit()
    db.refresh(resume)
    return resume


@router.delete("/{resume_id}", status_code=204)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = _get_owned_resume(resume_id, db, current_user)
    db.delete(resume)
    db.commit()


@router.post("/{resume_id}/review", response_model=ResumeOut)
def review_resume_endpoint(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Calls the AI provider to generate feedback and stores it on the resume."""
    resume = _get_owned_resume(resume_id, db, current_user)
    feedback = review_resume(resume.content)
    resume.ai_feedback = feedback
    db.commit()
    db.refresh(resume)
    return resume
