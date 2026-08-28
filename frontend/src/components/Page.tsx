import type { ReactNode } from 'react'

/** Consistent heading block for every content page. */
export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: ReactNode
  title: string
  lede?: ReactNode
}) {
  return (
    <header className="mb-8 max-w-3xl">
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-wide text-accent-secondary mb-2">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl sm:text-4xl font-bold gradient-text pb-1">{title}</h1>
      {lede ? <p className="mt-4 text-lg text-text-muted leading-relaxed">{lede}</p> : null}
    </header>
  )
}

/** Readable measure and consistent typography for prose content. */
export function Prose({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`prose-pr max-w-3xl ${className}`}>{children}</div>
}

/** A call to action back to the calculator, required on every content page. */
export function CalculatorCta({ label = 'Estimate your baggage fees', to = '/' }: { label?: string; to?: string }) {
  return (
    <div className="mt-10 rounded-2xl border border-accent-primary/25 bg-accent-primary/10 p-6 max-w-3xl">
      <h2 className="text-lg font-semibold text-white mb-2">Work out what your trip will cost</h2>
      <p className="text-sm text-text-muted mb-4">
        Enter your airline, fare and bags to see an itemised estimate with the source behind every
        figure.
      </p>
      <a
        href={to}
        className="inline-flex items-center rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {label}
      </a>
    </div>
  )
}
