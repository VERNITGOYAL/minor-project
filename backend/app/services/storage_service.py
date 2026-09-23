import os

import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/").removesuffix("/rest/v1")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "papers")


def _storage_url(path: str = "") -> str:
    return f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{path}".rstrip("/")


def _headers(content_type: str | None = None) -> dict[str, str]:
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Supabase Storage is not configured.")

    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    }
    if content_type:
        headers["Content-Type"] = content_type
    return headers


def upload_pdf(path: str, content: bytes) -> None:
    response = requests.post(
        _storage_url(path),
        headers=_headers("application/pdf"),
        data=content,
        timeout=60,
    )
    if not response.ok:
        raise RuntimeError(f"Supabase upload failed: {response.text}")


def download_pdf(path: str) -> bytes:
    response = requests.get(_storage_url(path), headers=_headers(), timeout=60)
    if not response.ok:
        raise FileNotFoundError("PDF file is unavailable in Supabase Storage.")
    return response.content


def delete_pdf(path: str) -> None:
    response = requests.delete(_storage_url(path), headers=_headers(), timeout=60)
    if not response.ok and response.status_code != 404:
        raise RuntimeError(f"Supabase deletion failed: {response.text}")
