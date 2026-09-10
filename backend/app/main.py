from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes.blob import router as blob_router
from app.routes.pdf import router as pdf_router
from app.utils.validation import ERROR_MESSAGES


app = FastAPI(
    title="Pink PDF Craft",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pdf_router, prefix="/api/pdf", tags=["pdf"])
app.include_router(blob_router, prefix="/api/blob", tags=["blob"])
app.include_router(pdf_router, prefix="/pdf", tags=["pdf-alias"])
app.include_router(blob_router, prefix="/blob", tags=["blob-alias"])


@app.exception_handler(RequestValidationError)
async def validation_handler(_request: Request, _exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {"code": "INVALID_FILE", "message": ERROR_MESSAGES["INVALID_FILE"]},
        },
    )


@app.get("/api/health")
@app.get("/health")
def health():
    return {"ok": True, "service": "pink-pdf-craft"}
