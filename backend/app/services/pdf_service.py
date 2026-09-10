import io

import fitz

from app.utils.validation import AppError, looks_like_pdf, validate_page_range


def _open_pdf(data: bytes, filename: str | None = None) -> fitz.Document:
    if not looks_like_pdf(data, filename):
        raise AppError("INVALID_PDF")
    try:
        doc = fitz.open(stream=data, filetype="pdf")
        if doc.page_count < 1:
            doc.close()
            raise AppError("INVALID_PDF")
        if doc.is_encrypted:
            unlocked = doc.authenticate("")
            if not unlocked:
                doc.close()
                raise AppError("INVALID_PDF")
        return doc
    except AppError:
        raise
    except Exception as exc:
        raise AppError("INVALID_PDF") from exc


def _save_compressed(doc: fitz.Document) -> bytes:
    buffer = io.BytesIO()
    doc.save(buffer, garbage=4, deflate=True, clean=True)
    return buffer.getvalue()


def merge_pdfs(files: list[tuple[bytes, str | None]]) -> bytes:
    if not files:
        raise AppError("INVALID_FILE")
    merged = fitz.open()
    opened: list[fitz.Document] = []
    try:
        for data, filename in files:
            src = _open_pdf(data, filename)
            opened.append(src)
            merged.insert_pdf(src)
        return _save_compressed(merged)
    except AppError:
        raise
    except Exception as exc:
        raise AppError("PDF_PROCESSING_FAILED", 500) from exc
    finally:
        for src in opened:
            src.close()
        merged.close()


def trim_pdf(data: bytes, start_page: int, end_page: int, filename: str | None = None) -> bytes:
    src = _open_pdf(data, filename)
    try:
        validate_page_range(start_page, end_page, src.page_count)
        out = fitz.open()
        try:
            out.insert_pdf(src, from_page=start_page - 1, to_page=end_page - 1)
            return _save_compressed(out)
        finally:
            out.close()
    except AppError:
        raise
    except Exception as exc:
        raise AppError("PDF_PROCESSING_FAILED", 500) from exc
    finally:
        src.close()
