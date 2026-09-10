import BlockButton from './BlockButton'

export default function ErrorBlock({ message, onRetry }) {
  return (
    <div className="block-card-cream mx-auto w-full max-w-3xl px-6 py-10 text-center" role="alert" aria-live="assertive">
      <div className="mb-3 text-3xl text-danger" aria-hidden="true">
        ⚠
      </div>
      <h2 className="font-pixel text-xl tracking-ui text-danger sm:text-2xl">OH NO! BLOCK ERROR</h2>
      <p className="mx-auto mt-3 max-w-md text-ink/80">{message}</p>
      {onRetry ? (
        <div className="mt-6">
          <BlockButton variant="secondary" onClick={onRetry}>
            [ TRY AGAIN ]
          </BlockButton>
        </div>
      ) : null}
    </div>
  )
}
