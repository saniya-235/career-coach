from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.chat import ChatMessage
from app.schemas.chat import ChatMessageCreate, ChatMessageOut
from app.services.chat_ai import get_chat_reply

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/", response_model=list[ChatMessageOut])
def get_history(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.owner_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )


@router.post("/", response_model=ChatMessageOut)
def send_message(
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_msg = ChatMessage(role="user", content=payload.content, owner_id=current_user.id)
    db.add(user_msg)
    db.commit()

    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.owner_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    formatted = [{"role": m.role, "content": m.content} for m in history]

    reply_text = get_chat_reply(formatted)

    assistant_msg = ChatMessage(role="assistant", content=reply_text, owner_id=current_user.id)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)
    return assistant_msg
