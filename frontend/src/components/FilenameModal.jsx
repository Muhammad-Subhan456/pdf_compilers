import { useEffect, useId, useState } from 'react'
import BlockButton from './BlockButton'
import Modal from './Modal'
import { sanitizeFilename, stripPdfExtension } from '../utils/filename'

export default function FilenameModal({
  heading = 'What should we call your PDF?',
  initialName,
  onDownload,
  busy,
}) {
  const inputId = useId()
  const [value, setValue] = useState(stripPdfExtension(initialName || 'My Merged Document'))

  useEffect(() => {
    setValue(stripPdfExtension(initialName || 'My Merged Document'))
  }, [initialName])

  function handleSubmit(event) {
    event.preventDefault()
    onDownload(sanitizeFilename(value))
  }

  return (
    <Modal labelledBy="filename-title">
      <form onSubmit={handleSubmit} className="text-center">
        <p className="text-pink" aria-hidden="true">
          ✦ ♥ ✦ ♥ ✦
        </p>
        <h2 id="filename-title" className="mt-2 font-pixel text-xl tracking-ui text-pink-deep sm:text-2xl">
          ✦ PDF CRAFTED! ✦
        </h2>
        <label htmlFor={inputId} className="mt-4 block text-ink">
          {heading}
        </label>
        <div className="mt-4 flex items-stretch border-[3px] border-ink bg-pink-soft text-left">
          <input
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-ink outline-none"
            autoComplete="off"
            autoFocus
          />
          <span className="flex items-center px-3 text-blush">.pdf</span>
        </div>
        <BlockButton type="submit" wide className="mt-5 py-3" disabled={busy}>
          [ DOWNLOAD PDF ]
        </BlockButton>
      </form>
    </Modal>
  )
}
