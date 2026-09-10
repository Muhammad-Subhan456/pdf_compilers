import { useEffect, useState } from 'react'
import Modal from './Modal'

export default function ProcessingModal({ title, steps, iconRow, progressLabel }) {
  const [progress, setProgress] = useState(8)

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 92) return value
        return value + Math.random() * 7
      })
    }, 400)
    return () => window.clearInterval(id)
  }, [])

  const shown = Math.min(96, Math.round(progress))

  return (
    <Modal labelledBy="processing-title">
      <div className="text-center">
        <h2 id="processing-title" className="font-pixel text-xl tracking-ui text-pink-deep sm:text-2xl">
          {title}
        </h2>
        {iconRow ? <div className="mt-5 flex items-center justify-center gap-2 text-pink">{iconRow}</div> : null}
        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center gap-3">
              {step.status === 'done' ? (
                <span className="text-success" aria-hidden="true">
                  ✓
                </span>
              ) : step.status === 'active' ? (
                <span className="text-pink" aria-hidden="true">
                  ●
                </span>
              ) : (
                <span className="text-blush/50" aria-hidden="true">
                  ○
                </span>
              )}
              <span
                className={
                  step.status === 'done'
                    ? 'text-success'
                    : step.status === 'active'
                      ? 'font-bold text-ink'
                      : 'text-blush'
                }
              >
                {step.label}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <div
            className="h-5 overflow-hidden border-[3px] border-ink bg-pink-soft"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={shown}
            aria-label="Crafting progress"
          >
            <div className="h-full bg-pink transition-all" style={{ width: `${shown}%` }} />
          </div>
          <div className="mt-1 flex items-center justify-between font-pixel text-[11px] tracking-ui text-blush">
            <span>{progressLabel || ''}</span>
            <span>{shown}%</span>
          </div>
        </div>
        <p className="mt-4 text-pink" aria-hidden="true">
          ✦ ♥ ✦ ♥ ✦
        </p>
      </div>
    </Modal>
  )
}
