import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / "backend"

# Ensure `backend/` is importable on Vercel and locally.
for path in (str(BACKEND), str(ROOT)):
    if path not in sys.path:
        sys.path.insert(0, path)

# Help Python resolve the app package when the function cwd differs.
os.environ.setdefault("PYTHONPATH", str(BACKEND))

from app.main import app  # noqa: E402

__all__ = ["app"]
