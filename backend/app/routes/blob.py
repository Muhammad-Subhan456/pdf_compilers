from fastapi import APIRouter, Request

from app.utils.storage import blob_enabled, generate_client_token

router = APIRouter()


@router.get("/status")
def blob_status():
    return {"blobEnabled": blob_enabled()}


@router.post("/token")
async def blob_token(request: Request):
    if not blob_enabled():
        return {"blobEnabled": False, "mode": "local"}

    body = await request.json()
    event_type = body.get("type")

    if event_type == "blob.generate-client-token":
        payload = body.get("payload") or {}
        pathname = payload.get("pathname") or "uploads/document.pdf"
        return {
            "type": "blob.generate-client-token",
            "clientToken": generate_client_token(pathname),
        }

    if event_type == "blob.upload-completed":
        return {"type": "blob.upload-completed"}

    pathname = body.get("filename") or body.get("pathname") or "uploads/document.pdf"
    return {
        "type": "blob.generate-client-token",
        "clientToken": generate_client_token(pathname),
        "blobEnabled": True,
    }
