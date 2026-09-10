export default function BlockButton({
  children,
  variant = 'primary',
  className = '',
  wide = false,
  type = 'button',
  ...props
}) {
  const variants = {
    primary:
      'bg-pink text-white hover:bg-pink-hover',
    secondary:
      'bg-white text-ink hover:bg-page',
    cream:
      'bg-cream text-ink hover:bg-white',
  }

  return (
    <button
      type={type}
      className={[
        'font-pixel tracking-ui inline-flex cursor-pointer items-center justify-center gap-2 border-[3px] border-ink px-5 py-2.5 shadow-block',
        'transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
        'disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-block',
        variants[variant] || variants.primary,
        wide ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
