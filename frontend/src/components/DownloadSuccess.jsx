import BlockButton from './BlockButton'
import PdfIcon from './PdfIcon'

export default function DownloadSuccess({
  title,
  subtitle,
  filename,
  onDownload,
  onAgain,
  againLabel,
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="text-pink" aria-hidden="true">
        ♥ ✦ ♥
      </p>
      <h1 className="mt-3 font-pixel text-2xl tracking-ui text-pink-deep sm:text-3xl">{title}</h1>
      <p className="mt-3 text-blush">{subtitle}</p>
      <div className="block-card mt-8 flex items-center gap-4 px-5 py-5 text-left">
        <PdfIcon size={52} />
        <p className="font-semibold break-all">{filename}</p>
      </div>
      <BlockButton wide className="mt-5 py-3.5" onClick={onDownload}>
        [ ✦ DOWNLOAD PDF ✦ ]
      </BlockButton>
      <BlockButton variant="secondary" wide className="mt-3 py-3" onClick={onAgain}>
        {againLabel}
      </BlockButton>
    </div>
  )
}
