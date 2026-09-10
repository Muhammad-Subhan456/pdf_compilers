export const LIMITS = {
  MAX_FILES: 20,
  MAX_FILE_BYTES: 50 * 1024 * 1024,
  MAX_TOTAL_BYTES: 200 * 1024 * 1024,
}

export const ERROR_COPY = {
  INVALID_FILE: {
    title: 'OH NO! BLOCK ERROR',
    message: 'This PDF couldn\'t be opened. Please try another PDF.',
    retry: true,
  },
  INVALID_PDF: {
    title: 'OH NO! BLOCK ERROR',
    message: 'This PDF couldn\'t be opened. Please try another PDF.',
    retry: true,
  },
  FILE_TOO_LARGE: {
    title: 'OH NO! BLOCK ERROR',
    message: 'This PDF is too large for the current crafting limit.',
    retry: false,
  },
  TOO_MANY_FILES: {
    title: 'OH NO! BLOCK ERROR',
    message: 'You can craft up to 20 PDF blocks at a time.',
    retry: false,
  },
  TOTAL_SIZE_EXCEEDED: {
    title: 'OH NO! BLOCK ERROR',
    message: 'This PDF is too large for the current crafting limit.',
    retry: false,
  },
  INVALID_PAGE_RANGE: {
    title: 'OH NO! BLOCK ERROR',
    message: 'Please enter a valid page range, for example 2-30.',
    retry: false,
  },
  PAGE_OUT_OF_RANGE: {
    title: 'OH NO! BLOCK ERROR',
    message: 'That page range doesn\'t exist in this PDF.',
    retry: false,
  },
  PDF_PROCESSING_FAILED: {
    title: 'OH NO! BLOCK ERROR',
    message: 'Something went wrong while crafting your PDF. Please try again.',
    retry: true,
  },
  STORAGE_ERROR: {
    title: 'OH NO! BLOCK ERROR',
    message: 'Something went wrong while crafting your PDF. Please try again.',
    retry: true,
  },
  INTERNAL_ERROR: {
    title: 'OH NO! BLOCK ERROR',
    message: 'Something went wrong while crafting your PDF. Please try again.',
    retry: true,
  },
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return ''
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`
  const mb = kb / 1024
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
}

export function isPdfFile(file) {
  if (!file) return false
  const name = (file.name || '').toLowerCase()
  const type = (file.type || '').toLowerCase()
  return name.endsWith('.pdf') || type === 'application/pdf'
}
