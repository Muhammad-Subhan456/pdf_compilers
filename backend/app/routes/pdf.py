from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, Response

from app.models.pdf_models import MergeJsonRequest, TrimJsonRequest
from app.services import pdf_service
from app.utils.filename import sanitize_filename
from app.utils.storage import delete_urls, fetch_bytes, put_output, read_local
from app.utils.validation import AppError, validate_counts

router = APIRouter()


def _error(exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": {"code": exc.code, "message": exc.message}},
    )


async def _read_form_file(upload) -> tuple[bytes, str]:
    data = await upload.read()
    return data, getattr(upload, "filename", None) or "document.pdf"


@router.post("/merge")
async def merge_pdfs(request: Request):
    blob_urls: list[str] = []
    try:
        content_type = request.headers.get("content-type", "")
        payloads: list[tuple[bytes, str | None]] = []

        if "application/json" in content_type:
            body = MergeJsonRequest.model_validate(await request.json())
            blob_urls = body.files
            validate_counts(len(body.files), [1] * len(body.files))
            for url in body.files:
                data = await fetch_bytes(url)
                payloads.append((data, "document.pdf"))
            validate_counts(len(payloads), [len(item[0]) for item in payloads])
            output_name = sanitize_filename(body.filename, "merged-document")
        else:
            form = await request.form()
            uploads = form.getlist("files")
            validate_counts(len(uploads), [1] * len(uploads))
            for upload in uploads:
                data, name = await _read_form_file(upload)
                payloads.append((data, name))
            validate_counts(len(payloads), [len(item[0]) for item in payloads])
            output_name = sanitize_filename(form.get("filename"), "merged-document")

        pdf_bytes = pdf_service.merge_pdfs(payloads)
        download_url = await put_output(output_name, pdf_bytes)
        await delete_urls(blob_urls)
        return {
            "success": True,
            "message": "PDF processed successfully.",
            "download_url": download_url,
            "filename": output_name,
        }
    except AppError as exc:
        await delete_urls(blob_urls)
        return _error(exc)
    except Exception:
        await delete_urls(blob_urls)
        return _error(AppError("PDF_PROCESSING_FAILED", 500))


@router.post("/trim")
async def trim_pdf(request: Request):
    blob_urls: list[str] = []
    try:
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            body = TrimJsonRequest.model_validate(await request.json())
            blob_urls = [body.file]
            data = await fetch_bytes(body.file)
            validate_counts(1, [len(data)])
            start, end = body.start_page, body.end_page
            output_name = sanitize_filename(body.filename, "trimmed-document")
            source_name = "document.pdf"
        else:
            form = await request.form()
            upload = form.get("file")
            start_raw = form.get("start_page")
            end_raw = form.get("end_page")
            if upload is None or start_raw is None or end_raw is None:
                raise AppError("INVALID_FILE")
            try:
                start, end = int(start_raw), int(end_raw)
            except (TypeError, ValueError) as exc:
                raise AppError("INVALID_PAGE_RANGE") from exc
            data, source_name = await _read_form_file(upload)
            validate_counts(1, [len(data)])
            output_name = sanitize_filename(form.get("filename"), "trimmed-document")

        pdf_bytes = pdf_service.trim_pdf(data, start, end, source_name)
        download_url = await put_output(output_name, pdf_bytes)
        await delete_urls(blob_urls)
        return {
            "success": True,
            "message": "PDF processed successfully.",
            "download_url": download_url,
            "filename": output_name,
        }
    except AppError as exc:
        await delete_urls(blob_urls)
        return _error(exc)
    except Exception:
        await delete_urls(blob_urls)
        return _error(AppError("PDF_PROCESSING_FAILED", 500))


@router.get("/download/{file_id}")
def download_local(file_id: str):
    try:
        data = read_local(file_id)
        return Response(
            content=data,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="crafted-document.pdf"'},
        )
    except AppError as exc:
        return _error(exc)
