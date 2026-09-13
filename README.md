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
- Deploy: one Vercel project (frontend + FastAPI share one domain)

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

Frontend and FastAPI deploy as **one** Vercel project. Client uploads go to Vercel Blob so large PDFs are not sent through the ~4.5 MB function payload limit. The API receives Blob URLs, processes PDFs with PyMuPDF, writes the result to Blob, and returns a download URL.

GitHub repo: `https://github.com/Muhammad-Subhan456/pdf_compilers.git`

### A. Prerequisites

- Vercel account at [vercel.com](https://vercel.com)
- Access to the GitHub repo above
- Latest deploy config pushed to `main` (`vercel.json`, `api/index.py`, root `requirements.txt`)

### B. Import the project

1. Vercel Dashboard → **Add New…** → **Project**
2. Import **`pdf_compilers`** from GitHub (authorize the Vercel GitHub app if prompted)
3. Framework Preset: **Other** / no framework (`vercel.json` owns the config)
4. Root Directory: **`.`** (repo root — do **not** set `frontend`)
5. Confirm build settings match `vercel.json`:
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
6. Prefer connecting Blob before the first production deploy (or deploy once, then add Blob and redeploy)

### C. Add Vercel Blob (required for real PDF sizes)

Without Blob, production falls back to multipart through the function and will fail for files near or over the ~4.5 MB function payload limit.

1. In the project → **Storage** → **Create** → **Blob**
2. Create a store (e.g. `pink-pdf-craft-blob`)
3. Connect it to this project for **Production** and **Preview**
4. Confirm **`BLOB_READ_WRITE_TOKEN`** appears under **Settings → Environment Variables** for Production (and Preview if you want preview deploys to behave the same)

### D. Deploy

1. Deploy from the import flow, or **Deployments → Redeploy** after Blob is connected
2. Wait for the build: Vite frontend build + Python deps from root `requirements.txt`
3. Open the production URL Vercel assigns (e.g. `https://pdf-compilers-….vercel.app`)

### E. Verify live

1. Home loads with the pink UI
2. `GET /api/health` → `{"ok":true,"service":"pink-pdf-craft"}`
3. `GET /api/blob/status` → `{"blobEnabled":true}`
4. Merge two small PDFs → download works
5. Trim with `2-3` → download works
6. Optional: upload a PDF larger than 5 MB to confirm the Blob path

### F. Optional

- **Settings → Domains**: add a custom domain
- Keep Hobby plan limits in mind (function duration/memory and Blob quotas)

## Project layout

```text
api/index.py              Vercel Python entry (exports FastAPI app)
backend/app/              FastAPI routes, PDF service, storage helpers
frontend/                 React + Vite UI
UI_Designs/               Screen mockups
vercel.json               Build, rewrites, function config
requirements.txt          Python deps for Vercel
```

## Environment

```text
BLOB_READ_WRITE_TOKEN=
```

Copy `.env.example` if you use Blob locally. No database URL or auth secrets are required.
