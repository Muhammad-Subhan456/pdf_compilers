export default function Modal({ children, labelledBy }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A1830]/45 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div className="block-card-cream w-full max-w-lg p-6 sm:p-8">{children}</div>
    </div>
  )
}
