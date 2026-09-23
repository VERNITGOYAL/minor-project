from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import Base, engine
from app.database.models import User, EmailOTP, Paper

from app.api.routes.papers import router as papers_router
from app.api.routes.auth import router as auth_router


# Create all database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="ResearchAI API",
    description="Backend API for the ResearchAI research paper analyzer.",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(papers_router)


@app.get("/")
def root():
    return {
        "message": "ResearchAI API is running",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }