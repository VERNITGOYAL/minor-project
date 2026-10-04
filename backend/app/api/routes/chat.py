import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.connection import get_db
from app.database.models import Paper, User
from app.services.chat_service import (
    get_query_embedding,
    get_conversation_messages,
    list_conversations,
    send_message,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["Chat"])


class ChatChunk(BaseModel):
    paper_id: int
    title: str = Field(min_length=1, max_length=500)
    page: int | None = None
    text: str = Field(min_length=1, max_length=10000)


class ChatMessageRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    conversation_id: str | None = None
    paper_id: int | None = None
    chunks: list[ChatChunk] = Field(min_length=1, max_length=5)


class QueryEmbeddingRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)


@router.get("/conversations")
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return {"conversations": list_conversations(current_user.id, db)}
    except Exception as error:
        logger.exception("Unable to load chat conversations")
        raise HTTPException(status_code=503, detail="Unable to load chat history.") from error


@router.get("/conversations/{conversation_id}/messages")
def get_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return {
            "messages": get_conversation_messages(
                current_user.id, conversation_id, db
            )
        }
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except Exception as error:
        logger.exception("Unable to load chat messages")
        raise HTTPException(status_code=503, detail="Unable to load chat messages.") from error


@router.post("/query-embedding")
def create_query_embedding(
    request: QueryEmbeddingRequest,
    current_user: User = Depends(get_current_user),
):
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=422, detail="Message cannot be empty.")
    try:
        return {"embedding": get_query_embedding(message)}
    except Exception as error:
        logger.exception("Unable to create chat query embedding")
        raise HTTPException(
            status_code=503, detail="Unable to prepare paper search."
        ) from error


@router.post("/messages")
def post_message(
    request: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    question = request.message.strip()
    if not question:
        raise HTTPException(status_code=422, detail="Message cannot be empty.")

    papers_query = db.query(Paper).filter(Paper.user_id == current_user.id)
    if request.paper_id is not None:
        papers_query = papers_query.filter(Paper.id == request.paper_id)
        if not papers_query.first():
            raise HTTPException(status_code=404, detail="Paper not found.")
    papers = papers_query.all()
    try:
        return send_message(
            user_id=current_user.id,
            message=question,
            papers=papers,
            db=db,
            conversation_id=request.conversation_id,
            paper_id=request.paper_id,
            chunks=[chunk.model_dump() for chunk in request.chunks],
        )
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception as error:
        logger.exception("RAG chat request failed")
        raise HTTPException(status_code=503, detail="Unable to answer from paper chunks.") from error
