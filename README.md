# Pink PDF Craft

A free, no-account web app for merging, lossless-compressing, and trimming PDFs. The UI matches the pink Minecraft-inspired mockups in `UI_Designs`.

Files are processed temporarily. Nothing is stored as a document library, and there are no user accounts.

## Features

- **Merge PDFs** — upload up to 20 PDFs, reorder them, then merge and losslessly compress
- **Trim PDF** — keep a page range such as `2-30` or `5-5`
- **Privacy** — temporary processing only; downloads use a short-lived file URL

Limits: 20 PDFs, 50 MB per file, 200 MB per operation.

## Stack

- Frontend: React, Vite, Tailwind CSS, `@dnd-kit`, `pdf-lib`
- Backend: FastAPI, PyMuPDF
- Storage: Vercel Blob in production, local temp files for development
- Deploy: one Vercel project

## Local development

Use two terminals.

### 1. Backend

```bash
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`). The frontend proxies `/api` to `http://127.0.0.1:8000`.

Without `BLOB_READ_WRITE_TOKEN`, uploads go straight to FastAPI as multipart files. That is the local default.

### Vercel-style local run

```bash
vercel dev
```

## Production (Vercel)

1. Push this repo and import it into Vercel.
2. Add `BLOB_READ_WRITE_TOKEN` from a Vercel Blob store.
3. Deploy. Frontend and FastAPI share one domain.

Client uploads go to Blob so large PDFs are not sent through the 4.5 MB function payload limit. The API receives Blob URLs, processes PDFs with PyMuPDF, writes the result to Blob, and returns a download URL.

## Project layout

```text
api/index.py              Vercel Python entry (exports FastAPI app)
backend/app/              FastAPI routes, PDF service, storage helpers
frontend/                 React + Vite UI
UI_Designs/               Screen mockups
vercel.json               Build, rewrites, function config
```

## Environment

Copy `.env.example` if you use Blob locally:

```text
BLOB_READ_WRITE_TOKEN=
```

No database URL or auth secrets are required.
