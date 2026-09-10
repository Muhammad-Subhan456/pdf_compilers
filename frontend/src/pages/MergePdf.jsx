import { useMemo, useRef, useState } from 'react'
import BlockButton from '../components/BlockButton'
import DownloadSuccess from '../components/DownloadSuccess'
import ErrorBlock from '../components/ErrorBlock'
import FileList from '../components/FileList'
import FileUploader from '../components/FileUploader'
import FilenameModal from '../components/FilenameModal'
import ProcessingModal from '../components/ProcessingModal'
import PdfIcon from '../components/PdfIcon'
import { mergePdfs, triggerDownload } from '../services/api'
import { uploadPdfs } from '../services/blob'
import { formatBytes } from '../utils/constants'
import { errorFromCode, getPdfPageCount, validateMergeSelection, validatePdfFile } from '../utils/validation'

const MERGE_STEPS = [
  { key: 'load', label: 'Loading PDF blocks' },
  { key: 'arrange', label: 'Arranging pages' },
  { key: 'compress', label: 'Compressing document' },
  { key: 'download', label: 'Preparing download' },
]

function nextId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function MergePdf() {
  const addRef = useRef(null)
  const [files, setFiles] = useState([])
  const [phase, setPhase] = useState('select')
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)

  const totals = useMemo(() => {
    const pages = files.reduce((sum, file) => sum + (file.pageCount || 0), 0)
    const size = files.reduce((sum, file) => sum + (file.size || 0), 0)
    return { pages, size }
  }, [files])

  async function addFiles(incoming) {
    setError(null)
    const valid = []
    for (const file of incoming) {
      const check = validatePdfFile(file)
      if (!check.ok) {
        setError(errorFromCode(check.code))
        return
      }
      const selection = validateMergeSelection(
        files.map((item) => item.file),
        [...valid, file],
      )
      if (!selection.ok) {
        setError(errorFromCode(selection.code))
        return
      }
      try {
        const pageCount = await getPdfPageCount(file)
        valid.push({
          id: nextId(),
          file,
          name: file.name,
          size: file.size,
          pageCount,
        })
      } catch {
        setError(errorFromCode('INVALID_PDF'))
        return
      }
    }
    setFiles((current) => [...current, ...valid])
  }

  function reset() {
    setFiles([])
    setPhase('select')
    setError(null)
    setResult(null)
    setBusy(false)
    setStepIndex(0)
  }

  async function handleMerge() {
    if (files.length < 1 || busy) return
    setBusy(true)
    setError(null)
    setPhase('processing')
    setStepIndex(0)
    const timers = [
      window.setTimeout(() => setStepIndex(1), 500),
      window.setTimeout(() => setStepIndex(2), 1100),
      window.setTimeout(() => setStepIndex(3), 1800),
    ]
    try {
      const uploaded = await uploadPdfs(files.map((item) => item.file))
      const data = await mergePdfs({
        files: uploaded.mode === 'local' ? uploaded.files : undefined,
        blobUrls: uploaded.mode === 'blob' ? uploaded.files.map((item) => item.url) : undefined,
      })
      setResult(data)
      setPhase('naming')
    } catch (err) {
      setError(errorFromCode(err.code || 'PDF_PROCESSING_FAILED'))
      setPhase(files.length ? 'list' : 'select')
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
      setPhase('list')
    } finally {
      setBusy(false)
    }
  }

  const steps = MERGE_STEPS.map((step, index) => ({
    ...step,
    status: index < stepIndex ? 'done' : index === stepIndex ? 'active' : 'todo',
  }))

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-10">
      <h1 className="text-center font-pixel text-2xl tracking-ui text-pink-deep sm:text-3xl">
        ✦ MERGE PDFs ✦
      </h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-blush">
        Place your PDF blocks in the order you want them crafted.
      </p>

      {error ? (
        <div className="mt-8">
          <ErrorBlock
            message={error.message}
            onRetry={error.retry ? () => setError(null) : undefined}
          />
        </div>
      ) : null}

      {phase === 'success' && result ? (
        <DownloadSuccess
          title="✦ PDF CRAFTED! ✦"
          subtitle="Your document is ready."
          filename={result.filename}
          onDownload={() => triggerDownload(result.download_url, result.filename)}
          onAgain={reset}
          againLabel="[ CRAFT ANOTHER ]"
        />
      ) : null}

      {phase !== 'success' && files.length === 0 ? (
        <div className="mt-8">
          <FileUploader
            multiple
            title="DROP PDF BLOCKS HERE"
            subtitle="or click to choose files"
            buttonLabel="[ + CHOOSE PDFs ]"
            hint="PDF files only • Max 20 files"
            onFiles={addFiles}
            disabled={busy}
          />
          <p className="mt-4 text-center text-sm text-blush">
            Up to 20 PDFs • 50 MB per file recommended • 200 MB total recommended
          </p>
        </div>
      ) : null}

      {phase !== 'success' && files.length > 0 ? (
        <div className="mt-8">
          <div className="flex items-center justify-between gap-3 border-[3px] border-pink bg-white px-4 py-3 shadow-block-pink">
            <p className="text-ink">Add more PDF blocks</p>
            <input
              ref={addRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              className="sr-only"
              onChange={(event) => {
                addFiles(Array.from(event.target.files || []))
                event.target.value = ''
              }}
            />
            <BlockButton className="shrink-0 px-4 py-2 text-sm" onClick={() => addRef.current?.click()} disabled={busy}>
              [ + ADD MORE ]
            </BlockButton>
          </div>

          <div className="mt-6">
            <p className="font-pixel text-xs tracking-ui text-ink">
              YOUR PDF BLOCKS{' '}
              <span className="text-blush">
                {files.length} PDF BLOCKS • {totals.pages} PAGES
              </span>
            </p>
            <p className="mt-1 text-sm text-blush">≡ Drag blocks to change their order</p>
            <div className="mt-3">
              <FileList
                files={files}
                onReorder={setFiles}
                onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
              />
            </div>
            <p className="mt-3 text-sm text-blush">{formatBytes(totals.size)} selected</p>
            <BlockButton wide className="mt-4 py-3.5" onClick={handleMerge} disabled={busy || files.length < 1}>
              [ ✦ MERGE & COMPRESS ✦ ]
            </BlockButton>
          </div>
        </div>
      ) : null}

      {phase === 'processing' ? (
        <ProcessingModal
          title="✦ CRAFTING YOUR PDF ✦"
          iconRow={
            <>
              <PdfIcon size={22} />
              <span>+</span>
              <PdfIcon size={22} />
              <span>+</span>
              <PdfIcon size={22} />
              <span>→</span>
              <span>✦</span>
              <span>→</span>
              <PdfIcon size={22} />
            </>
          }
          steps={steps}
        />
      ) : null}

      {phase === 'naming' && result ? (
        <FilenameModal
          initialName="My Merged Document"
          heading="What should we call your PDF?"
          onDownload={handleNamedDownload}
          busy={busy}
        />
      ) : null}
    </div>
  )
}
