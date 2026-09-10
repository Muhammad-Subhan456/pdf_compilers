import re

UNSAFE = re.compile(r'[<>:"/\\|?*\x00-\x1f]')


def sanitize_filename(raw: str | None, fallback: str = "crafted-document") -> str:
    name = (raw or "").strip()
    name = UNSAFE.sub("", name)
    name = name.replace("..", ".")
    name = name.lstrip(".")
    if name.lower().endswith(".pdf"):
        name = name[:-4]
    name = re.sub(r"\s+", " ", name).strip()
    if not name:
        name = fallback
    return f"{name[:180]}.pdf"
