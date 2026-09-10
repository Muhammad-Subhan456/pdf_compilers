from pydantic import BaseModel, Field


class MergeJsonRequest(BaseModel):
    files: list[str] = Field(min_length=1)
    filename: str | None = None


class TrimJsonRequest(BaseModel):
    file: str
    start_page: int
    end_page: int
    filename: str | None = None
