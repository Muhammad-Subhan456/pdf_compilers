import { ERROR_COPY, LIMITS, isPdfFile } from './constants'

export async function getPdfPageCount(file) {
  const { PDFDocument } = await import('pdf-lib')
  const buffer = await file.arrayBuffer()
  const pdf = await PDFDocument.load(buffer, { ignoreEncryption: false })
  return pdf.getPageCount()
}

export function validatePdfFile(file) {
  if (!file || file.size === 0) {
    return { ok: false, code: 'INVALID_FILE' }
  }
  if (!isPdfFile(file)) {
    return { ok: false, code: 'INVALID_FILE' }
  }
  if (file.size > LIMITS.MAX_FILE_BYTES) {
    return { ok: false, code: 'FILE_TOO_LARGE' }
  }
  return { ok: true }
}

export function validateMergeSelection(existingFiles, incomingFiles) {
  const combined = [...existingFiles, ...incomingFiles]
  if (combined.length > LIMITS.MAX_FILES) {
    return { ok: false, code: 'TOO_MANY_FILES' }
  }
  const total = combined.reduce((sum, file) => sum + (file.size || 0), 0)
  if (total > LIMITS.MAX_TOTAL_BYTES) {
    return { ok: false, code: 'TOTAL_SIZE_EXCEEDED' }
  }
  return { ok: true }
}

export function parsePageRange(value) {
  const raw = String(value || '').trim()
  const match = raw.match(/^(\d+)\s*-\s*(\d+)$/)
  if (!match) return null
  const start = Number(match[1])
  const end = Number(match[2])
  if (!Number.isInteger(start) || !Number.isInteger(end)) return null
  if (start < 1 || end < 1 || start > end) return null
  return { start, end }
}

export function validatePageRange(value, pageCount) {
  const parsed = parsePageRange(value)
  if (!parsed) {
    return { ok: false, code: 'INVALID_PAGE_RANGE' }
  }
  if (pageCount && (parsed.start > pageCount || parsed.end > pageCount)) {
    return { ok: false, code: 'PAGE_OUT_OF_RANGE' }
  }
  return { ok: true, ...parsed }
}

export function errorFromCode(code) {
  return ERROR_COPY[code] || ERROR_COPY.INTERNAL_ERROR
}
