from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.connection import get_db
from app.database.models import User
from app.database.models import Paper
from app.services.paper_service import save_paper

router = APIRouter(
    prefix="/api/papers",
    tags=["Papers"],
)


@router.post("/upload")
async def upload_paper(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        paper = await save_paper(
            file=file,
            user_id=current_user.id,
            db=db,
        )

        return {
            "success": True,
            "message": "Paper uploaded successfully.",
            "paper": serialize_paper(paper),
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.get("")
def list_papers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    papers = (
        db.query(Paper)
        .filter(Paper.user_id == current_user.id)
        .order_by(Paper.created_at.desc())
        .all()
    )
    return {"papers": [serialize_paper(paper) for paper in papers]}


@router.delete("/{paper_id}")
def delete_paper(
    paper_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    paper = (
        db.query(Paper)
        .filter(Paper.id == paper_id, Paper.user_id == current_user.id)
        .first()
    )

    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")

    file_path = Path(paper.file_path)

    if file_path.is_absolute():
        try:
            file_path.unlink(missing_ok=True)
        except OSError as error:
            raise HTTPException(
                status_code=500,
                detail="Unable to delete the legacy local PDF.",
            ) from error
    else:
        from app.services.storage_service import delete_pdf

        try:
            delete_pdf(paper.file_path)
        except RuntimeError as error:
            raise HTTPException(status_code=502, detail=str(error)) from error

    db.delete(paper)
    db.commit()

    return {"message": "Paper deleted successfully."}


@router.get("/{paper_id}/file")
def view_paper(
    paper_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    paper = (
        db.query(Paper)
        .filter(Paper.id == paper_id, Paper.user_id == current_user.id)
        .first()
    )

    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")

    file_path = Path(paper.file_path)

    if file_path.is_absolute():
        if not file_path.is_file():
            raise HTTPException(status_code=404, detail="PDF file is unavailable.")

        return FileResponse(
            path=file_path,
            media_type="application/pdf",
            filename=paper.original_filename,
            content_disposition_type="inline",
        )

    from app.services.storage_service import download_pdf

    try:
        content = download_pdf(paper.file_path)
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    return Response(
        content=content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{paper.original_filename}"',
        },
    )


def serialize_paper(paper: Paper):
    return {
        "id": paper.id,
        "title": paper.title,
        "name": paper.original_filename,
        "original_filename": paper.original_filename,
        "size": f"{paper.file_size / 1048576:.1f} MB",
        "file_size": paper.file_size,
        "created_at": paper.created_at.isoformat() if paper.created_at else None,
        "author": "Uploaded paper",
        "year": str(paper.created_at.year) if paper.created_at else "",
    }