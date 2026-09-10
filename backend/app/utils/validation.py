MAX_FILES = 20
MAX_FILE_BYTES = 50 * 1024 * 1024
MAX_TOTAL_BYTES = 200 * 1024 * 1024

ERROR_MESSAGES = {
    "INVALID_FILE": "This PDF couldn't be opened. Please try another PDF.",
    "INVALID_PDF": "This PDF couldn't be opened. Please try another PDF.",
    "FILE_TOO_LARGE": "This PDF is too large for the current crafting limit.",
    "TOO_MANY_FILES": "You can craft up to 20 PDF blocks at a time.",
    "TOTAL_SIZE_EXCEEDED": "This PDF is too large for the current crafting limit.",
    "INVALID_PAGE_RANGE": "Please enter a valid page range, for example 2-30.",
    "PAGE_OUT_OF_RANGE": "That page range doesn't exist in this PDF.",
    "PDF_PROCESSING_FAILED": "Something went wrong while crafting your PDF. Please try again.",
    "STORAGE_ERROR": "Something went wrong while crafting your PDF. Please try again.",
    "INTERNAL_ERROR": "Something went wrong while crafting your PDF. Please try again.",
}


class AppError(Exception):
    def __init__(self, code: str, status_code: int = 400):
        self.code = code
        self.status_code = status_code
        self.message = ERROR_MESSAGES.get(code, ERROR_MESSAGES["INTERNAL_ERROR"])
        super().__init__(self.message)


def looks_like_pdf(data: bytes, filename: str | None = None, content_type: str | None = None) -> bool:
    if not data:
        return False
    return b"%PDF-" in data[:1024]


def validate_counts(file_count: int, sizes: list[int]) -> None:
    if file_count < 1:
        raise AppError("INVALID_FILE")
    if file_count > MAX_FILES:
        raise AppError("TOO_MANY_FILES")
    if any(size > MAX_FILE_BYTES for size in sizes):
        raise AppError("FILE_TOO_LARGE")
    if sum(sizes) > MAX_TOTAL_BYTES:
        raise AppError("TOTAL_SIZE_EXCEEDED")


def validate_page_range(start_page: int, end_page: int, page_count: int) -> None:
    if start_page < 1 or end_page < 1 or start_page > end_page:
        raise AppError("INVALID_PAGE_RANGE")
    if start_page > page_count or end_page > page_count:
        raise AppError("PAGE_OUT_OF_RANGE")
