import os
import uuid
from pathlib import Path
from urllib.parse import quote

import httpx

from app.utils.validation import AppError

BLOB_ENDPOINT = "https://blob.vercel-storage.com"
TEMP_DIR = Path(os.environ.get("TMPDIR") or os.environ.get("TEMP") or "/tmp") / "pink-pdf-craft"


def blob_enabled() -> bool:
    return bool(os.getenv("BLOB_READ_WRITE_TOKEN"))


def _token() -> str:
    token = os.getenv("BLOB_READ_WRITE_TOKEN")
    if not token:
        raise AppError("STORAGE_ERROR", 500)
    return token


def _store_id(token: str) -> str:
    parts = token.split("_")
    if len(parts) < 4:
        raise AppError("STORAGE_ERROR", 500)
    return parts[3]


def generate_client_token(pathname: str) -> str:
    import base64
    import hashlib
    import hmac
    import json
    import time

    token = _token()
    store_id = _store_id(token)
    payload_object = {
        "pathname": pathname,
        "allowedContentTypes": ["application/pdf", "application/octet-stream"],
        "maximumSizeInBytes": 50 * 1024 * 1024,
        "addRandomSuffix": True,
        "validUntil": int(time.time() * 1000) + 60 * 60 * 1000,
    }
    payload = base64.b64encode(
        json.dumps(payload_object, separators=(",", ":")).encode("utf-8")
    ).decode("ascii")
    secured_key = hmac.new(token.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    encoded = base64.b64encode(f"{secured_key}.{payload}".encode("utf-8")).decode("ascii")
    return f"vercel_blob_client_{store_id}_{encoded}"


def save_local(data: bytes) -> str:
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    file_id = uuid.uuid4().hex
    path = TEMP_DIR / f"{file_id}.pdf"
    path.write_bytes(data)
    return f"/api/pdf/download/{file_id}"


def read_local(file_id: str) -> bytes:
    if not file_id.isalnum() or len(file_id) > 64:
        raise AppError("INVALID_FILE")
    path = TEMP_DIR / f"{file_id}.pdf"
    if not path.exists():
        raise AppError("INVALID_FILE", 404)
    return path.read_bytes()


async def fetch_bytes(url: str) -> bytes:
    try:
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.content
    except Exception as exc:
        raise AppError("STORAGE_ERROR", 502) from exc


async def put_output(filename: str, data: bytes) -> str:
    if not blob_enabled():
        return save_local(data)

    pathname = f"outputs/{uuid.uuid4().hex}-{filename}"
    headers = {
        "Authorization": f"Bearer {_token()}",
        "x-content-type": "application/pdf",
        "x-add-random-suffix": "true",
        "x-cache-control-max-age": "1800",
    }
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.put(
                f"{BLOB_ENDPOINT}/{quote(pathname)}",
                headers=headers,
                content=data,
            )
            response.raise_for_status()
            payload = response.json()
            return payload.get("downloadUrl") or payload["url"]
    except AppError:
        raise
    except Exception as exc:
        raise AppError("STORAGE_ERROR", 502) from exc


async def delete_urls(urls: list[str]) -> None:
    if not blob_enabled() or not urls:
        return
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            for url in urls:
                await client.request(
                    "DELETE",
                    f"{BLOB_ENDPOINT}/delete",
                    headers={
                        "Authorization": f"Bearer {_token()}",
                        "Content-Type": "application/json",
                    },
                    json={"url": url},
                )
    except Exception:
        return
