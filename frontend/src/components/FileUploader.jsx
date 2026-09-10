import { useRef, useState } from 'react'
import BlockButton from './BlockButton'
import { PdfIconOutline } from './PdfIcon'

export default function FileUploader({
  multiple = false,
  title,
  subtitle,
  buttonLabel,
  hint,
  onFiles,
  disabled,
}) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function pickFiles(fileList) {
    const files = Array.from(fileList || [])
    if (files.length) onFiles(multiple ? files : files.slice(0, 1))
  }

  return (
    <div
      className={[
        'block-card mx-auto max-w-3xl px-6 py-14 text-center shadow-block-pink',
        dragging ? 'bg-pink-soft' : 'bg-white',
      ].join(' ')}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        pickFiles(event.dataTransfer.files)
      }}
    >
      <div className="mb-5 flex items-center justify-center gap-2">
        {multiple ? (
          <>
            <PdfIconOutline size={36} />
            <PdfIconOutline size={36} />
            <PdfIconOutline size={36} />
          </>
        ) : (
          <div className="flex flex-col items-center">
            <PdfIconOutline size={56} />
            <span className="mt-1 font-pixel text-[10px] tracking-ui text-pink">PDF BLOCK</span>
          </div>
        )}
      </div>
      <h2 className="font-pixel text-xl tracking-ui text-ink sm:text-2xl">{title}</h2>
      <p className="mt-2 text-blush">{subtitle}</p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple={multiple}
        className="sr-only"
        aria-label={multiple ? 'Choose PDF files' : 'Choose a PDF file'}
        onChange={(event) => {
          pickFiles(event.target.files)
          event.target.value = ''
        }}
      />
      <BlockButton
        className="mt-6 px-8 py-3"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {buttonLabel}
      </BlockButton>
      {hint ? <p className="mt-4 text-sm text-blush">{hint}</p> : null}
    </div>
  )
}
