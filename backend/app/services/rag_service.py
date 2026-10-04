import hashlib
import json
import logging
import os
import re
import shutil
from pathlib import Path

import pymupdf as fitz
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.database.models import Paper
from app.services.storage_service import download_pdf


logger = logging.getLogger(__name__)
BACKEND_DIR = Path(__file__).resolve().parents[2]
INDEX_DIR = BACKEND_DIR / "data" / "chroma_db"
load_dotenv(BACKEND_DIR / ".env")

_embeddings = None
_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)


def _get_embeddings():
    global _embeddings

    if _embeddings is None:
        logger.info("Loading sentence-transformer embedding model")
        _embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        logger.info("Sentence-transformer embedding model loaded")

    return _embeddings


def _read_pdf(paper: Paper) -> bytes:
    path = Path(paper.file_path)
    if path.is_absolute():
        try:
            return path.read_bytes()
        except OSError as error:
            raise FileNotFoundError("PDF file is unavailable.") from error

    return download_pdf(paper.file_path)


def _extract_page_documents(content: bytes, paper: Paper) -> list[Document]:
    page_documents = []
    with fitz.open(stream=content, filetype="pdf") as pdf:
        for page_number, page in enumerate(pdf, start=1):
            text = page.get_text("text").strip()
            if text:
                page_documents.append(
                    Document(
                        page_content=text,
                        metadata={
                            "paper_id": paper.id,
                            "title": paper.title,
                            "page": page_number,
                        },
                    )
                )

    if not page_documents:
        raise ValueError(
            "Could not extract text from this PDF. It may be scanned or image-only."
        )

    return page_documents


def _validate_research_paper(page_documents: list[Document]) -> None:
    text = "\n".join(document.page_content for document in page_documents).lower()
    if len(text) < 1200:
        raise ValueError(
            "This PDF has too little readable text to verify that it is a research "
            "paper. It may be scanned or image-only; OCR is required for those PDFs."
        )

    section_patterns = {
        "abstract": r"\babstract\b",
        "introduction": r"\bintroduction\b",
        "related_work": r"\b(?:related work|literature review)\b",
        "methods": r"\b(?:methodology|methods|materials and methods|experimental setup)\b",
        "results": r"\b(?:results|findings|experiments)\b",
        "discussion": r"\bdiscussion\b",
        "conclusion": r"\bconclusions?\b",
        "references": r"\b(?:references|bibliography)\b",
    }
    sections = {
        name for name, pattern in section_patterns.items() if re.search(pattern, text)
    }
    has_intro_or_abstract = bool(sections & {"abstract", "introduction"})
    has_method_or_result = bool(sections & {"methods", "results"})
    has_citations = bool(sections & {"references"}) or bool(
        re.search(r"\bdoi\s*:\s*10\.|\barxiv\s*:\s*\d", text)
    )
    has_minimum_structure = len(sections) >= 4 or (
        len(sections) >= 3 and bool(re.search(r"\bdoi\s*:\s*10\.|\barxiv\s*:\s*\d", text))
    )

    if not (
        has_minimum_structure
        and has_intro_or_abstract
        and has_method_or_result
        and has_citations
    ):
        raise ValueError(
            "This PDF could not be verified as a research paper. Analysis supports "
            "papers with an abstract or introduction, research methods or results, "
            "and references or publication identifiers."
        )


def _paper_index(
    paper: Paper,
    user_id: int,
    content: bytes,
    page_documents: list[Document],
) -> Chroma:
    paper_dir = INDEX_DIR / f"user_{user_id}" / f"paper_{paper.id}"
    manifest_path = paper_dir / "index.json"
    fingerprint = hashlib.sha256(content).hexdigest()

    manifest = None
    if manifest_path.is_file():
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            manifest = None

    if manifest is None or manifest.get("fingerprint") != fingerprint:
        logger.info("Building RAG index for paper %s", paper.id)
        if paper_dir.exists():
            shutil.rmtree(paper_dir)

        chunks = _splitter.split_documents(page_documents)
        paper_dir.mkdir(parents=True, exist_ok=True)
        vector_store = Chroma.from_documents(
            documents=chunks,
            embedding=_get_embeddings(),
            persist_directory=str(paper_dir),
        )
        manifest_path.write_text(
            json.dumps({"fingerprint": fingerprint}),
            encoding="utf-8",
        )
        logger.info("RAG index ready for paper %s", paper.id)
        return vector_store

    return Chroma(
        persist_directory=str(paper_dir),
        embedding_function=_get_embeddings(),
    )


def delete_paper_index(user_id: int, paper_id: int) -> None:
    paper_dir = INDEX_DIR / f"user_{user_id}" / f"paper_{paper_id}"
    shutil.rmtree(paper_dir, ignore_errors=True)


def analyze_paper(paper: Paper, user_id: int) -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured in backend/.env.")

    content = _read_pdf(paper)
    page_documents = _extract_page_documents(content, paper)
    _validate_research_paper(page_documents)
    vector_store = _paper_index(paper, user_id, content, page_documents)
    paper_dir = INDEX_DIR / f"user_{user_id}" / f"paper_{paper.id}"
    fingerprint = hashlib.sha256(content).hexdigest()
    cache_path = paper_dir / "analysis.json"

    if cache_path.is_file():
        try:
            cached = json.loads(cache_path.read_text(encoding="utf-8"))
            if cached.get("fingerprint") == fingerprint:
                return cached["result"]
        except (OSError, json.JSONDecodeError, KeyError):
            pass

    queries = [
        "paper abstract summary research objective and problem statement",
        "research methodology methods models algorithms and experiments",
        "dataset data source evaluation accuracy performance metrics",
        "main results findings contributions limitations and future work",
        "paper title authors and keywords",
    ]
    ranked_documents = []
    for query in queries:
        ranked_documents.extend(
            (score, document)
            for document, score in vector_store.similarity_search_with_score(query, k=4)
        )

    ranked_documents.sort(key=lambda result: result[0])
    selected_documents = []
    seen_chunks = set()
    for _, document in ranked_documents:
        chunk = document.page_content.strip()
        if chunk and chunk not in seen_chunks:
            seen_chunks.add(chunk)
            selected_documents.append(document)
        if len(selected_documents) >= 16:
            break

    if not selected_documents:
        raise ValueError("No readable text was found in the selected papers.")

    context = "\n\n".join(
        f"[Paper: {document.metadata.get('title', 'Research paper')}; "
        f"page {document.metadata.get('page', '?')}]\n{document.page_content}"
        for document in selected_documents
    )[:30000]

    from langchain_groq import ChatGroq

    llm = ChatGroq(
        api_key=api_key,
        model="openai/gpt-oss-120b",
        temperature=0,
    )
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "Analyze the research paper using only the supplied excerpts. "
                "Do not invent details. Use 'Not specified in the paper' when a "
                "field is absent. Return only a valid JSON object with these "
                "top-level fields: title, authors, summary, objective, problem, "
                "models, dataset, data_source, accuracy, other_metrics, "
                "methodology, findings, limitations, and keywords. Use arrays "
                "for authors, models, other_metrics, findings, limitations, "
                "and keywords.",
            ),
            ("human", "Paper context:\n{context}"),
        ]
    )

    try:
        logger.info("Sending paper analysis request to Groq for paper %s", paper.id)
        response = llm.invoke(prompt.format_messages(context=context))
        logger.info("Received paper analysis from Groq for paper %s", paper.id)
    except Exception as error:
        logger.exception("RAG analysis generation failed for paper %s", paper.id)
        raise RuntimeError("The RAG model could not analyze this paper.") from error

    raw_analysis = response.content
    if not isinstance(raw_analysis, str):
        raw_analysis = "".join(
            part.get("text", "") if isinstance(part, dict) else str(part)
            for part in raw_analysis
        )
    cleaned = raw_analysis.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    try:
        analysis = json.loads(cleaned.strip())
    except json.JSONDecodeError as error:
        logger.exception("RAG model returned invalid analysis JSON for paper %s", paper.id)
        raise RuntimeError("The RAG model returned an invalid analysis response.") from error

    sources = []
    seen = set()
    for document in selected_documents:
        key = (document.metadata.get("paper_id"), document.metadata.get("page"))
        if key in seen:
            continue
        seen.add(key)
        sources.append(
            {
                "paper_id": key[0],
                "title": document.metadata.get("title", "Research paper"),
                "page": key[1],
                "snippet": document.page_content[:400].strip(),
            }
        )

    result = {"analysis": analysis, "sources": sources}
    cache_path.write_text(
        json.dumps({"fingerprint": fingerprint, "result": result}),
        encoding="utf-8",
    )
    return result