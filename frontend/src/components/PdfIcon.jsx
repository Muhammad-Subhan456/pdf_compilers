export default function PdfIcon({ size = 48, className = '' }) {
  const box = size
  return (
    <svg
      width={box}
      height={box}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="6" fill="#FF5BA8" />
      <rect x="12" y="9" width="24" height="30" rx="3" fill="white" />
      <rect x="16" y="15" width="16" height="2.5" fill="#FF5BA8" />
      <rect x="16" y="21" width="16" height="2.5" fill="#FF5BA8" />
      <rect x="16" y="27" width="10" height="2.5" fill="#FF5BA8" />
    </svg>
  )
}

export function PdfIconOutline({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="1.5" y="1.5" width="37" height="37" rx="5" stroke="#FF5BA8" strokeWidth="3" fill="#FFF8FB" />
      <rect x="12" y="10" width="16" height="20" rx="2" stroke="#FF5BA8" strokeWidth="2" />
      <rect x="15" y="15" width="10" height="2" fill="#FF5BA8" />
      <rect x="15" y="19" width="10" height="2" fill="#FF5BA8" />
    </svg>
  )
}

export function ScissorsIcon({ className = '' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2.2" />
      <path d="M8.5 7.5 L20 20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8.5 16.5 L20 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export function DiamondIcon({ className = 'text-pink' }) {
  return (
    <span className={className} aria-hidden="true">
      ✦
    </span>
  )
}
