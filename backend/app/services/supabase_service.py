import os

from dotenv import load_dotenv
from supabase import create_client, Client

from app.core.config import BASE_DIR

load_dotenv(BASE_DIR / ".env")


def get_supabase_client() -> Client:
    supabase_url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    if not supabase_url or not service_key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_KEY must be configured in backend/.env."
        )

    return create_client(supabase_url, service_key)


BUCKET_NAME = os.getenv("SUPABASE_STORAGE_BUCKET", "papers")