import { Link } from 'react-router-dom'
import BlockButton from '../components/BlockButton'
import PdfIcon, { ScissorsIcon } from '../components/PdfIcon'

function MiniPdf({ faded = false }) {
  return (
    <span
      className={[
        'inline-flex h-10 w-10 items-center justify-center border-2',
        faded ? 'border-pink-muted bg-pink-soft/40 text-pink-muted' : 'border-pink bg-pink-soft text-pink',
      ].join(' ')}
      aria-hidden="true"
    >
      ▣
    </span>
  )
}

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:pt-14">
      <p className="text-center font-pixel text-xs tracking-ui text-pink sm:text-sm">
        ✦ PDF CRAFTING STATION ✦
      </p>
      <h1 className="mt-3 text-center font-display text-4xl font-semibold leading-tight text-ink sm:text-6xl">
        Craft your PDFs.
        <br />
        Simple. Free. Pink.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-center text-blush">
        Merge your PDF blocks or trim away the pages you don&apos;t need.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link to="/merge">
          <BlockButton className="min-w-[200px] px-8 py-3">✦ MERGE PDFs</BlockButton>
        </Link>
        <Link to="/trim">
          <BlockButton variant="secondary" className="min-w-[200px] px-8 py-3">
            <ScissorsIcon /> TRIM PDF
          </BlockButton>
        </Link>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3" aria-hidden="true">
        <div className="flex items-center gap-2">
          <PdfIcon size={48} />
          <span className="text-pink">+</span>
          <PdfIcon size={48} />
          <span className="text-pink">+</span>
          <PdfIcon size={48} />
        </div>
        <span className="text-pink">↓</span>
        <span className="border-[3px] border-ink bg-pink px-4 py-1 font-pixel text-xs tracking-ui text-white shadow-block-sm">
          ✦ CRAFTING ✦
        </span>
        <span className="text-pink">↓</span>
        <div className="flex flex-col items-center">
          <PdfIcon size={56} />
          <span className="mt-1 font-pixel text-[10px] tracking-ui text-pink">FINAL PDF</span>
        </div>
      </div>

      <h2 className="mt-14 text-center font-pixel text-sm tracking-ui text-ink">YOUR CRAFTING TOOLS</h2>

      <section className="mt-5 block-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-pixel text-lg tracking-ui text-pink">✦ MERGE PDFs</h3>
          <span className="text-pink" aria-hidden="true">
            ▾
          </span>
        </div>
        <p className="mt-2 text-blush">Combine multiple PDF files into one organized document.</p>
        <div className="my-5 flex items-center justify-center gap-2" aria-hidden="true">
          <MiniPdf />
          <MiniPdf />
          <MiniPdf />
          <span className="text-pink">→</span>
          <PdfIcon size={40} />
        </div>
        <Link to="/merge" className="block">
          <BlockButton wide className="py-3">
            [ START CRAFTING ]
          </BlockButton>
        </Link>
      </section>

      <section className="mt-6 block-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-pixel text-lg tracking-ui text-pink">
            <span className="inline-flex items-center gap-2">
              <ScissorsIcon /> TRIM PDF
            </span>
          </h3>
          <span className="text-pink" aria-hidden="true">
            ▾
          </span>
        </div>
        <p className="mt-2 text-blush">Keep only the pages you need.</p>
        <div className="my-5 flex items-center justify-center gap-3" aria-hidden="true">
          <PdfIcon size={44} />
          <span className="text-pink">×</span>
          <MiniPdf faded />
          <MiniPdf faded />
        </div>
        <Link to="/trim" className="block">
          <BlockButton variant="secondary" wide className="py-3">
            [ START TRIMMING ]
          </BlockButton>
        </Link>
      </section>
    </div>
  )
}
