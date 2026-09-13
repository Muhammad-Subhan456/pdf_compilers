# PDF Tools — Product Requirements Document

## 1. Product Overview

**PDF Tools** is a lightweight, free web application designed primarily for non-technical users who need common PDF operations without paying for a subscription.

The initial version will focus on two core capabilities:

1. **Merge & Compress PDFs**
2. **Trim / Extract Pages from a PDF**


The product will prioritize:

* Simplicity
* Minimal UI
* Fast processing
* Easy deployment
* Privacy
* No user account requirement
* No unnecessary features
* Free usage for normal personal documents

The application will be designed as a small serverless web application deployed entirely on Vercel.

---

## 2. Product Goals

### Primary Goals

* Allow users to merge multiple PDF files into one PDF.
* Allow users to control the order of PDFs before merging.
* Automatically perform lossless compression after merging.
* Allow users to extract a specific page range from a PDF.
* Allow users to download the generated PDF.
* Allow users to specify the output filename.
* Require no account or login.
* Avoid permanent storage of user documents.
* Keep the application simple enough to maintain as a small personal project.

### Non-Goals for Version 1

The following features are intentionally excluded:

* PDF editing
* PDF annotation
* PDF signing
* PDF password removal
* OCR
* PDF-to-Word conversion
* Word-to-PDF conversion
* Image-to-PDF conversion
* PDF watermarking
* User accounts
* Cloud document history
* Team collaboration
* Payment/subscription system
* Advanced compression controls
* Complex page selection syntax

These can be considered in future versions if there is a real need.

---

# 3. Target User

The primary target user is a non-technical person who wants to perform basic PDF operations without learning complicated software or paying for premium PDF tools.

The interface should therefore require minimal technical knowledge.

The user should be able to understand the application without documentation.

---

# 4. Core Features

## 4.1 Merge PDFs

### Description

Users can upload multiple PDF files and combine them into one PDF.

### User Flow

1. User opens the Merge PDFs page.
2. User selects multiple PDF files.
3. Uploaded files appear in a list.
4. User can drag and drop files to change their order.
5. The displayed order represents the final merge order.
6. User clicks **Merge & Compress**.
7. Backend merges the PDFs.
8. Backend performs lossless compression.
9. User is asked for the output filename.
10. Generated PDF is made available for download.
11. Temporary files are eventually removed.

### Example

Input:

```text
document-3.pdf
document-1.pdf
document-2.pdf
```

If the user arranges them as:

```text
document-1.pdf
document-3.pdf
document-2.pdf
```

the resulting PDF must contain:

```text
document-1.pdf
        ↓
document-3.pdf
        ↓
document-2.pdf
```

in exactly that order.

### Requirements

* Multiple PDFs must be supported.
* Files must be reorderable.
* Drag-and-drop ordering should be supported.
* The frontend must preserve the selected order.
* Backend must process PDFs in the exact order received.
* Invalid PDF files must be rejected.
* The output filename must be user-defined.
* The `.pdf` extension should be added automatically if omitted.
* Generated output must be downloadable.

---

# 5. Trim PDF

## Description

Users can upload a PDF and specify a page range to extract.

### User Flow

1. User opens the Trim PDF page.
2. User uploads one PDF.
3. User enters a page range.
4. User clicks **Trim PDF**.
5. Backend validates the page range.
6. Backend extracts the requested pages.
7. Generated PDF is made available for download.
8. Temporary files are removed.

### Example

Input:

```text
document.pdf
```

Page range:

```text
2-30
```

Output:

```text
pages 2 through 30
```

The output should contain 29 pages.

### Version 1 Page Range

Only the following syntax is required:

```text
2-30
```

Single-page extraction such as:

```text
5-5
```

may also be supported.

The following syntax is intentionally excluded from V1:

```text
1-5,8,10-15
```

---

# 6. Compression Requirements

The Merge operation must perform **lossless PDF compression** after merging.

The goal is to reduce unnecessary PDF structure overhead without intentionally reducing image quality.

Version 1 will not provide different compression levels.

Future versions may provide:

* Normal
* Strong
* Maximum

However, this is outside the V1 scope.

---

# 7. File Validation

The application must validate uploaded files on both frontend and backend.

### Frontend Validation

The frontend should check:

* File extension
* MIME type where available
* Number of files
* File size
* Empty files

### Backend Validation

The backend must independently verify:

* The file is actually a readable PDF.
* The PDF can be opened by the PDF processing library.
* The requested page range is valid.
* The requested pages exist.

Frontend validation must never be considered a security boundary.

---

# 8. File Size and Serverless Constraints

Because the backend is deployed using Vercel Functions, the system must respect Vercel's function payload constraints.

V1 should therefore use a controlled upload strategy rather than claiming unlimited file sizes.

For a Vercel-native implementation, larger files should be uploaded to temporary Vercel Blob storage directly from the client rather than passing the entire file through the FastAPI request.

Recommended initial application limits:

```text
Maximum number of PDFs:
20

Recommended maximum individual PDF:
50 MB

Recommended maximum total operation:
200 MB
```

These are application-level limits and can be adjusted after testing.

The actual processing architecture must account for Vercel's 4.5 MB function request/response payload constraints rather than attempting to send large PDFs directly through the serverless function.

---

# 9. Privacy Requirements

The application should not maintain permanent copies of user PDFs.

Expected lifecycle:

```text
Upload
   ↓
Temporary storage
   ↓
Processing
   ↓
Generated PDF
   ↓
Download
   ↓
Temporary data cleanup
```

The application should not store:

* PDF contents
* Document history
* User documents permanently
* User account information
* Personal document metadata unless required for processing

The product should communicate clearly that uploaded files are processed temporarily.

---

# 10. Error Handling

The application should provide understandable messages.

Examples:

### Invalid PDF

```text
This file could not be opened as a PDF.
Please upload a valid PDF file.
```

### Invalid page range

```text
Please enter a valid page range, for example 2-30.
```

### Page does not exist

```text
The selected page range is outside this PDF's page count.
```

### File too large

```text
This file is too large for the current limit.
```

### Processing failure

```text
We couldn't process this PDF.
Please try again with another file.
```

Technical stack traces must not be shown to the user.

---

# 11. User Interface Requirements

See the Folder Named UI_Designs, It Includes the designs for the screens that must be built same as it is.
The UI should be beginner-friendly, playful, and visually inspired by Minecraft while remaining clear and practical for PDF tasks.

The design should use a pink Minecraft-inspired theme with blocky visual elements, pixel-style typography, chunky controls, and subtle game-like interactions.

The interface should feel like a friendly pink crafting station for working with PDFs.


# 12. Download Requirements

The user should be able to download the generated PDF through a clear, prominent button.

The download action should fit the pink Minecraft-inspired theme.

Example:

```text
[ ✦ DOWNLOAD CRAFTED PDF ✦ ]
```

The output filename should be configurable.

For example:

```text
Input:
documents.pdf

User enters:
University Documents

Download:
University Documents.pdf
```

The application should sanitize filenames before using them.

After processing, the download screen should display:

```text
╔════════════════════════════════════╗
║          ✦ PDF CRAFTED! ✦          ║
║                                    ║
║  University Documents.pdf          ║
║                                    ║
║       [ DOWNLOAD PDF ]             ║
╚════════════════════════════════════╝
```

The download button should:

* Use the generated file URL.
* Preserve the sanitized output filename.
* Be clearly visible.
* Work on desktop and mobile.
* Remain available until the user starts another operation or the temporary file expires.

The user should also have an option to return to the tool:

```text
[ CRAFT ANOTHER PDF ]
```

The application should not expose internal storage paths or technical file identifiers to the user.

---

# 13. Accessibility

The UI should support:

* Keyboard-accessible buttons
* Visible focus states
* Proper labels for inputs
* Clear error messages
* Sufficient text contrast
* Drag-and-drop with an accessible alternative

Drag-and-drop must not be the only way to reorder files.

---

# 14. Performance Requirements

The application should:

* Avoid unnecessary uploads.
* Show processing status.
* Prevent duplicate submissions while processing.
* Disable processing buttons during active operations.
* Provide clear feedback when processing begins and ends.

Example:

```text
Uploading...
Processing...
Compressing...
Preparing download...
```

---

# 15. Security Requirements

The backend must:

* Validate uploaded files.
* Never trust filenames.
* Sanitize output filenames.
* Avoid executing uploaded content.
* Use temporary storage.
* Clean up temporary files.
* Avoid exposing internal filesystem paths.
* Return generic errors to users.
* Limit resource consumption through file/count limits.

---

# 16. Future Features

Possible future additions:

1. Split PDF
2. Rotate PDF
3. Delete pages
4. Reorder pages
5. Extract selected pages
6. PDF password protection
7. PDF watermarking
8. Image to PDF
9. PDF to images
10. Strong image-based compression
11. Batch processing
12. Mobile PWA support

These should not be implemented until the initial two features are stable.

---

# 17. V1 Success Criteria

The MVP is considered successful when a non-technical user can:

### Merge

```text
Upload PDFs
→ Arrange them
→ Click Merge & Compress
→ Enter filename
→ Download PDF
```

without needing instructions.

### Trim

```text
Upload PDF
→ Enter 2-30
→ Click Trim
→ Download PDF
```

without needing instructions.

The application should be deployable as a single Vercel project and require no database or authentication.
