export default function PageRangeInput({ value, onChange, pageCount, error }) {
  return (
    <div className="mx-auto w-full max-w-3xl text-left">
      <label htmlFor="page-range" className="font-pixel text-xs tracking-ui text-blush">
        PAGE RANGE
      </label>
      <input
        id="page-range"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="2-30"
        inputMode="numeric"
        autoComplete="off"
        aria-describedby="page-range-help"
        aria-invalid={Boolean(error)}
        className="block-card-cream mt-2 w-full px-4 py-6 text-center font-display text-4xl font-semibold tracking-wide outline-none sm:text-5xl"
      />
      <p id="page-range-help" className="mt-2 text-sm text-ink/80">
        Example: 2-30 keeps pages 2 through 30.
      </p>
      {pageCount ? (
        <p className="mt-1 text-sm text-blush">This PDF has {pageCount} pages.</p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
