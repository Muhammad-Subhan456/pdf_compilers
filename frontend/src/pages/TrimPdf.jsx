import { useRef, useState } from 'react'
import BlockButton from '../components/BlockButton'
import DownloadSuccess from '../components/DownloadSuccess'
import ErrorBlock from '../components/ErrorBlock'
import FileUploader from '../components/FileUploader'
import FilenameModal from '../components/FilenameModal'
import PageRangeInput from '../components/PageRangeInput'
import PdfIcon, { ScissorsIcon } from '../components/PdfIcon'
import ProcessingModal from '../components/ProcessingModal'
import { triggerDownload, trimPdf } from '../services/api'
import { uploadPdfs } from '../services/blob'
import { formatBytes } from '../utils/constants'
import { errorFromCode, getPdfPageCount, validatePageRange, validatePdfFile } from '../utils/validation'

const TRIM_STEPS = [
  { key: 'select', label: 'Selecting pages...' },
  { key: 'remove', label: 'Removing unused blocks...' },
  { key: 'craft', label: 'Crafting your new document...' },
]

export default function TrimPdf() {
  const changeRef = useRef(null)
  const [item, setItem] = useState(null)
  const [range, setRange] = useState('2-30')
  const [rangeError, setRangeError] = useState('')
  const [phase, setPhase] = useState('select')
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [usedRange, setUsedRange] = useState(null)
  const [busy, setBusy] = useState(false)

  async function setPdf(file) {
    setError(null)
    setRangeError('')
    const check = validatePdfFile(file)
    if (!check.ok) {
      setError(errorFromCode(check.code))
      setItem(null)
      return
    }
    try {
      const pageCount = await getPdfPageCount(file)
      setItem({ file, name: file.name, size: file.size, pageCount })
      setPhase('ready')
    } catch {
      setError(errorFromCode('INVALID_PDF'))
      setItem(null)
    }
  }

  function reset() {
    setItem(null)
    setRange('2-30')
    setRangeError('')
    setPhase('select')
    setError(null)
    setResult(null)
    setUsedRange(null)
    setBusy(false)
    setStepIndex(0)
  }

  async function handleTrim() {
    if (!item || busy) return
    const parsed = validatePageRange(range, item.pageCount)
    if (!parsed.ok) {
      const copy = errorFromCode(parsed.code)
      setRangeError(copy.message)
      setError(copy)
      return
    }
    setBusy(true)
    setError(null)
    setRangeError('')
    setPhase('processing')
    setStepIndex(0)
    const timers = [
      window.setTimeout(() => setStepIndex(1), 500),
      window.setTimeout(() => setStepIndex(2), 1200),
    ]
    try {
      const uploaded = await uploadPdfs([item.file])
      const data = await trimPdf({
        file: uploaded.mode === 'local' ? uploaded.files[0] : undefined,
        blobUrl: uploaded.mode === 'blob' ? uploaded.files[0].url : undefined,
        startPage: parsed.start,
        endPage: parsed.end,
      })
      setUsedRange(parsed)
      setResult(data)
      setPhase('naming')
    } catch (err) {
      setError(errorFromCode(err.code || 'PDF_PROCESSING_FAILED'))
      setPhase('ready')
    } finally {
      timers.forEach((id) => window.clearTimeout(id))
      setBusy(false)
    }
  }

  async function handleNamedDownload(filename) {
    if (!result?.download_url) return
    setBusy(true)
    try {
      await triggerDownload(result.download_url, filename)
      setResult((current) => ({ ...current, filename }))
      setPhase('success')
    } catch {
      setError(errorFromCode('PDF_PROCESSING_FAILED'))
      setPhase('ready')
    } finally {
      setBusy(false)
    }
  }

  const steps = TRIM_STEPS.map((step, index) => ({
    ...step,
    status: index < stepIndex ? 'done' : index === stepIndex ? 'active' : 'todo',
  }))

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-10">
      <h1 className="flex items-center justify-center gap-2 font-pixel text-2xl tracking-ui text-pink-deep sm:text-3xl">
        <ScissorsIcon /> TRIM PDF
      </h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-blush">
        Keep the pages you need and leave the rest behind.
      </p>

      {error ? (
        <div className="mt-8">
          <ErrorBlock
            message={error.message}
            onRetry={error.retry ? () => setError(null) : undefined}
          />
        </div>
      ) : null}

      {phase === 'success' && result && usedRange ? (
        <DownloadSuccess
          title="✦ TRIM COMPLETE! ✦"
          subtitle={`Pages ${usedRange.start}-${usedRange.end} have been crafted into a new PDF.`}
          filename={result.filename}
          onDownload={() => triggerDownload(result.download_url, result.filename)}
          onAgain={reset}
          againLabel="[ TRIM ANOTHER ]"
        />
      ) : null}

      {phase !== 'success' && !item ? (
        <div className="mt-8">
          <FileUploader
            title="DROP PDF HERE"
            subtitle="or click to choose a file"
            buttonLabel="[ + CHOOSE PDF ]"
            hint="Only one PDF at a time • PDF files only"
            onFiles={(files) => setPdf(files[0])}
            disabled={busy}
          />
        </div>
      ) : null}

      {phase !== 'success' && item ? (
        <div className="mt-8 space-y-6">
          <div className="block-card-cream flex items-center gap-4 px-4 py-4">
            <PdfIcon size={48} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{item.name}</p>
              <p className="text-sm text-blush">
                {formatBytes(item.size)} • {item.pageCount} pages
              </p>
            </div>
            <input
              ref={changeRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) setPdf(file)
                event.target.value = ''
              }}
            />
            <BlockButton variant="secondary" className="px-4 py-2 text-sm" onClick={() => changeRef.current?.click()}>
              [ CHANGE ]
            </BlockButton>
          </div>

          <PageRangeInput
            value={range}
            onChange={(value) => {
              setRange(value)
              setRangeError('')
              setError(null)
            }}
            pageCount={item.pageCount}
            error={rangeError}
          />

          <BlockButton wide className="py-3.5" onClick={handleTrim} disabled={busy}>
            [ ✦ TRIM PDF ✦ ]
          </BlockButton>
        </div>
      ) : null}

      {phase === 'processing' ? (
        <ProcessingModal
          title={
            <span className="inline-flex items-center gap-2">
              <ScissorsIcon /> TRIMMING PDF
            </span>
          }
          steps={steps}
          progressLabel="CRAFTING XP"
        />
      ) : null}

      {phase === 'naming' && result ? (
        <FilenameModal
          initialName="My Trimmed Document"
          heading="What should we call your trimmed PDF?"
          onDownload={handleNamedDownload}
          busy={busy}
        />
      ) : null}
    </div>
  )
}
