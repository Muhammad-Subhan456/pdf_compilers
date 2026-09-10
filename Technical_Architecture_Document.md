# PDF Tools — Technical Architecture Document

## 1. Architecture Overview

PDF Tools will use a lightweight serverless architecture.

The frontend and backend will be deployed as a **single Vercel project**.

```text
                         USER
                           │
                           ▼
                 ┌──────────────────┐
                 │    Frontend      │
                 │ React + Vite     │
                 └────────┬─────────┘
                          │
              ┌───────────┴────────────┐
              │                        │
              ▼                        ▼
       Direct file upload       API requests
       to temporary Blob             │
              │                      │
              └───────────┬──────────┘
                          ▼
                ┌──────────────────┐
                │ Vercel Functions │
                │                  │
                │ FastAPI          │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ PDF Service      │
                │                  │
                │ PyMuPDF          │
                └────────┬─────────┘
                         │
                         ▼
                Process PDF files
                         │
                         ▼
                Temporary output
                         │
                         ▼
                Vercel Blob
                         │
                         ▼
                  Download URL
                         │
                         ▼
                        USER
```

Vercel officially supports FastAPI through its Python runtime and serverless functions, including deploying FastAPI alongside a frontend in a single project.

---

# 2. Technology Stack

## Frontend

```text
React
Vite
Tailwind CSS
@dnd-kit
```

### Responsibilities

* PDF selection
* Drag-and-drop ordering
* Page range input
* Filename input
* Client-side validation
* Upload progress
* Processing status
* Download interface

---

# 3. Backend

```text
Python
FastAPI
PyMuPDF
```

FastAPI provides the API layer while PyMuPDF performs the actual PDF operations.

The backend is deployed as a Vercel Python Function.

---

# 4. Storage

## Vercel Blob

Vercel Blob is used only because serverless functions have payload limitations.

The application should not send large PDFs directly inside the FastAPI request.

Instead:

```text
Browser
   ↓
Vercel Blob
   ↓
Blob URL
   ↓
FastAPI
   ↓
Download/process file
```

This prevents large PDF binaries from unnecessarily passing through the API request.

Vercel explicitly recommends client-side uploads to Vercel Blob when function payloads are too large.

---

# 5. Why No Database?

No database is required.

The application does not need to persist:

* Users
* Documents
* Operations
* File history
* Preferences
* Accounts

The database is intentionally excluded from the architecture.

---

# 6. Why No Redis?

Redis is unnecessary because:

* There is no persistent job queue in V1.
* Processing is request-driven.
* There are no background workflows.
* There is no shared application state.

If processing eventually becomes asynchronous, a queue can be introduced later.

---

# 7. Why No Celery?

Celery is also unnecessary.

The application is intentionally designed for relatively short PDF-processing operations.

The request lifecycle is:

```text
Request
   ↓
Retrieve input PDFs
   ↓
Process
   ↓
Upload result
   ↓
Return result URL
```

For very long-running operations, the architecture can later evolve toward an asynchronous worker model.

Vercel documents function timeout constraints and recommends other mechanisms for workloads requiring longer execution.

---

# 8. Project Structure

Recommended repository:

```text
pdf-tools/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUploader.jsx
│   │   │   ├── FileList.jsx
│   │   │   ├── FileItem.jsx
│   │   │   ├── PageRangeInput.jsx
│   │   │   ├── FilenameInput.jsx
│   │   │   ├── ProcessingState.jsx
│   │   │   └── DownloadButton.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── MergePdf.jsx
│   │   │   └── TrimPdf.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── blob.js
│   │   │
│   │   ├── utils/
│   │   │   ├── validation.js
│   │   │   └── filename.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   │
│   ├── api/
│   │   └── index.py
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   │
│   │   ├── routes/
│   │   │   └── pdf.py
│   │   │
│   │   ├── services/
│   │   │   └── pdf_service.py
│   │   │
│   │   ├── models/
│   │   │   └── pdf_models.py
│   │   │
│   │   └── utils/
│   │       ├── validation.py
│   │       ├── storage.py
│   │       └── filename.py
│   │
│   ├── requirements.txt
│   └── pyproject.toml
│
├── vercel.json
├── .gitignore
└── README.md
```

---

# 9. Vercel Entry Point

The important backend entry point is:

```text
backend/api/index.py
```

It should expose the FastAPI application.

Conceptually:

```python
from app.main import app
```

Vercel's Python runtime recognizes Python files in the `api/` directory as serverless functions, and the FastAPI application should be exposed through the expected `app` variable.

---

# 10. FastAPI Application Structure

## main.py

Responsibilities:

* Create FastAPI application.
* Register routes.
* Configure middleware if required.
* Configure API metadata.

Conceptually:

```text
main.py
   │
   └── FastAPI()
         │
         └── pdf router
```

---

# 11. API Routes

Only two primary business endpoints are required.

## Merge

```http
POST /api/pdf/merge
```

Input:

```text
file references / uploaded PDF references
output filename
```

Output:

```json
{
    "success": true,
    "download_url": "..."
}
```

---

## Trim

```http
POST /api/pdf/trim
```

Input:

```text
file reference
start_page
end_page
output filename
```

Output:

```json
{
    "success": true,
    "download_url": "..."
}
```

---

# 12. Upload Architecture

Because Vercel functions have a 4.5 MB request payload limit, large PDF binaries should not be sent directly through the FastAPI function.

The preferred flow is:

```text
                   Browser
                      │
                      │ upload
                      ▼
              ┌───────────────┐
              │ Vercel Blob   │
              └───────┬───────┘
                      │
                   blob URL
                      │
                      ▼
              ┌───────────────┐
              │ FastAPI       │
              │ Vercel Func.  │
              └───────┬───────┘
                      │
                      ▼
                 PyMuPDF
```

The API receives references to the files rather than unnecessarily carrying the full file payload.

---

# 13. Merge Processing Flow

```text
1. User selects PDFs
        ↓
2. Frontend displays files
        ↓
3. User reorders files
        ↓
4. Frontend uploads files
        ↓
5. Blob URLs are returned
        ↓
6. Frontend sends ordered references
        ↓
7. FastAPI validates references
        ↓
8. FastAPI retrieves PDFs
        ↓
9. PyMuPDF opens PDFs
        ↓
10. PDFs are inserted in requested order
        ↓
11. Output PDF is saved
        ↓
12. Lossless compression is applied
        ↓
13. Output uploaded to Blob
        ↓
14. Download URL returned
        ↓
15. Frontend presents download
```

---

# 14. Merge Algorithm

Conceptually:

```text
Create empty PDF
        │
        ├── insert PDF #1
        │
        ├── insert PDF #2
        │
        ├── insert PDF #3
        │
        └── insert PDF #N
                │
                ▼
          Save compressed
                │
                ▼
             Output
```

PyMuPDF supports inserting pages from one PDF into another, making it suitable for the merge implementation.

---

# 15. Compression

The merge service should use PyMuPDF's lossless save/compression capabilities.

The first implementation should prioritize:

```text
garbage collection
+
deflate compression
```

rather than image recompression.

This means V1 focuses on structural/lossless optimization.

---

# 16. Trim Processing Flow

```text
User uploads PDF
        ↓
Upload to Blob
        ↓
Receive Blob reference
        ↓
Send reference + page range
        ↓
FastAPI validates PDF
        ↓
Read page count
        ↓
Validate range
        ↓
Create output PDF
        ↓
Copy requested pages
        ↓
Save output
        ↓
Upload result to Blob
        ↓
Return download URL
```

---

# 17. Page Number Handling

The user-facing page numbering should be **1-based**.

Example:

```text
User:
2-30
```

Internally:

```text
start = 2 - 1
end = 30 - 1
```

So the PDF processing layer uses the appropriate zero-based page indexes.

The backend must verify:

```text
1 <= start_page <= total_pages
1 <= end_page <= total_pages
start_page <= end_page
```

---

# 18. Download Architecture

Because Vercel function responses are also limited to 4.5 MB, the backend should not return a potentially large generated PDF directly as the function response.

Instead:

```text
FastAPI
   ↓
Generate PDF
   ↓
Upload output to Blob
   ↓
Return URL
   ↓
Browser
   ↓
Download from Blob
```

This is an important architectural decision.

---

# 19. Temporary Storage Lifecycle

There should be no permanent document database.

Files should have a short lifecycle:

```text
Upload
   ↓
Temporary Blob
   ↓
Processing
   ↓
Output Blob
   ↓
Download
   ↓
Cleanup / expiration
```

The Blob storage configuration should use short-lived objects where possible.

The application should not expose a document history.

---

# 20. API Response Design

Success:

```json
{
    "success": true,
    "message": "PDF processed successfully.",
    "download_url": "...",
    "filename": "merged-document.pdf"
}
```

Validation error:

```json
{
    "success": false,
    "error": {
        "code": "INVALID_PAGE_RANGE",
        "message": "The selected page range is invalid."
    }
}
```

Processing error:

```json
{
    "success": false,
    "error": {
        "code": "PDF_PROCESSING_FAILED",
        "message": "The PDF could not be processed."
    }
}
```

---

# 21. Error Codes

Recommended codes:

```text
INVALID_FILE
INVALID_PDF
FILE_TOO_LARGE
TOO_MANY_FILES
TOTAL_SIZE_EXCEEDED
INVALID_PAGE_RANGE
PAGE_OUT_OF_RANGE
PDF_PROCESSING_FAILED
STORAGE_ERROR
INTERNAL_ERROR
```

The frontend can map these codes to friendly messages.

---

# 22. Security Architecture

## File Validation

The backend must verify that files are valid PDFs rather than trusting:

```text
.pdf
application/pdf
```

alone.

## Filename Sanitization

User-provided filenames must be sanitized.

Example:

```text
../../output.pdf
```

must never be used directly as a filesystem path.

The backend should generate safe output filenames.

## Resource Limits

The backend should enforce:

```text
Maximum file count
Maximum individual file size
Maximum total operation size
Maximum page range
```

## No Shell-Based PDF Processing

Do not invoke external shell commands using user-controlled filenames.

The application should use PyMuPDF directly.

---

# 23. CORS

If frontend and backend are deployed under the same Vercel domain:

```text
https://pdf-tools.vercel.app
```

with:

```text
/api/pdf/merge
/api/pdf/trim
```

then cross-origin API configuration can largely be avoided.

The frontend communicates with:

```text
/api/pdf/merge
/api/pdf/trim
```

using relative URLs.

Vercel's own combined frontend + FastAPI deployment example uses this same single-domain model.

---

# 24. Environment Variables

Potential variables:

```text
BLOB_READ_WRITE_TOKEN
```

No database URL is required.

No JWT secret is required.

No external API keys are required.

The frontend should not contain private server credentials.

---

# 25. Deployment Architecture

The entire application should be deployed as:

```text
                    VERCEL
                      │
        ┌─────────────┴──────────────┐
        │                            │
        ▼                            ▼
    Frontend                    Python Runtime
    React/Vite                    FastAPI
        │                            │
        │                            ▼
        │                         PyMuPDF
        │                            │
        └──────────────┬─────────────┘
                       │
                       ▼
                  Vercel Blob
```

Vercel supports the combined frontend + Python architecture, allowing both parts to live under one deployment/domain.

---

# 26. Local Development

The application should be developed so that the local environment resembles production.

Preferred command:

```bash
vercel dev
```

This allows the frontend and Vercel-style API routing to be tested together locally. Vercel's Python guidance explicitly uses `vercel dev` for this workflow.

---

# 27. Architecture Principles

The project should follow these principles:

### Keep it small

Do not introduce infrastructure unless a real requirement appears.

### Stateless backend

The FastAPI application should not depend on local persistent state.

### No database

There is no persistent application data.

### No authentication

V1 is a public utility.

### Temporary files

Documents exist only for processing/download purposes.

### Separate responsibilities

```text
Frontend
    ↓
UI + interaction

FastAPI
    ↓
API + validation

PDF Service
    ↓
PDF processing

Blob
    ↓
Temporary file storage
```

### Deployment simplicity

Everything should remain deployable from a single Vercel project.

---

# 28. Final Architecture

The final V1 architecture is:

```text
┌───────────────────────────────────────────────────┐
│                     VERCEL                        │
│                                                   │
│  ┌───────────────────┐      ┌──────────────────┐ │
│  │ React + Vite      │      │ FastAPI          │ │
│  │                   │      │ Python Function  │ │
│  │ - Upload UI       │─────▶│                  │ │
│  │ - Drag & Drop     │      │ - Validation     │ │
│  │ - Page Range      │      │ - Merge          │ │
│  │ - Filename        │      │ - Trim           │ │
│  │ - Download        │      │ - Compression    │ │
│  └───────────────────┘      └────────┬─────────┘ │
│                                      │           │
│                                      ▼           │
│                              ┌───────────────┐   │
│                              │    PyMuPDF    │   │
│                              └───────┬───────┘   │
│                                      │           │
│                                      ▼           │
│                              ┌───────────────┐   │
│                              │ Vercel Blob   │   │
│                              │               │   │
│                              │ Temporary     │   │
│                              │ PDF storage   │   │
│                              └───────────────┘   │
│                                                   │
└───────────────────────────────────────────────────┘
```

## Final Technology List

```text
Frontend
├── React
├── Vite
├── Tailwind CSS
└── @dnd-kit

Backend
├── Python
├── FastAPI
└── PyMuPDF

Storage
└── Vercel Blob

Deployment
└── Vercel

Database
└── None

Authentication
└── None

Queue
└── None

Cache
└── None
```

This is intentionally the smallest architecture that still handles the important reality of **Vercel's serverless request/response payload limits**. For tiny PDFs, direct API upload/download could work, but the Blob-based flow makes the architecture much more robust for normal documents while keeping everything inside the Vercel ecosystem.
