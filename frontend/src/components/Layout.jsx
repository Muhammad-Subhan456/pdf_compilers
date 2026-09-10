import { NavLink } from 'react-router-dom'
import PdfIcon from './PdfIcon'

const NAV = [
  { to: '/', label: 'HOME', end: true },
  { to: '/merge', label: 'MERGE PDFS' },
  { to: '/trim', label: 'TRIM PDF' },
]

export default function Layout({ children }) {
  return (
    <div className="flex min-h-svh flex-col bg-page">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:font-pixel"
      >
        Skip to content
      </a>
      <header className="border-b-[3px] border-ink bg-[#FFF7FB]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2 no-underline">
            <PdfIcon size={36} />
            <span className="font-pixel text-sm tracking-ui text-pink sm:text-base">
              ✦ PINK PDF CRAFT
            </span>
          </NavLink>
          <nav aria-label="Primary" className="flex flex-wrap items-center justify-end gap-2">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'font-pixel tracking-ui border-[3px] border-ink px-3 py-1.5 text-xs shadow-block-sm sm:px-4 sm:text-sm',
                    isActive ? 'bg-pink text-white' : 'bg-white text-ink hover:bg-page',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" className="relative flex-1">{children}</main>

      <footer className="border-t-[3px] border-ink bg-[#FFF7FB] px-4 py-5 text-center">
        <p className="font-pixel text-xs tracking-ui text-pink sm:text-sm">
          ♥ Crafted with ♥ • Your PDFs stay yours
        </p>
        <p className="mt-1 text-xs text-blush">
          Your files are processed temporarily and aren&apos;t kept as a document library.
        </p>
        <p className="mt-2 text-[11px] text-pink-muted">© 2026 Pink PDF Craft</p>
      </footer>
    </div>
  )
}
