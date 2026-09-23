from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import ALLOWED_EXTENSIONS, MAX_FILE_SIZE
from app.database.models import Paper
from app.services.storage_service import upload_pdf


async def save_paper(
    file: UploadFile,
    user_id: int,
    db: Session,
) -> Paper:

    if not file.filename:
        raise ValueError("No file was provided.")

    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Only PDF files are allowed.")

    content = await file.read()

    if not content:
        raise ValueError("The uploaded file is empty.")

    if len(content) > MAX_FILE_SIZE:
        raise ValueError("File size cannot exceed 50 MB.")

    saved_filename = f"{user_id}/{uuid4()}.pdf"

    try:
        upload_pdf(saved_filename, content)
    except RuntimeError as error:
        raise ValueError(str(error)) from error

    title = Path(file.filename).stem

    paper = Paper(
        user_id=user_id,
        title=title,
        original_filename=file.filename,
        filename=saved_filename,
        file_path=saved_filename,
        file_size=len(content),
    )

    db.add(paper)
    db.commit()
    db.refresh(paper)

    return paper