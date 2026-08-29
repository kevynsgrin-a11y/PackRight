/** Shared display formatting. */

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export const formatMoney = (amount: number, currency = 'USD'): string =>
  currency === 'USD'
    ? usd.format(amount)
    : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)

/** Formats an ISO date for display. Returns null for a missing or unparseable value. */
export const formatDate = (iso: string | null | undefined): string | null => {
  if (!iso) return null
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return null
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/** "18 x 14 x 8 in", or null when any dimension is missing. */
export const formatDimensions = (
  l: number | null | undefined,
  w: number | null | undefined,
  h: number | null | undefined,
): string | null => {
  if (l == null || w == null || h == null) return null
  const n = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))
  return `${n(l)} x ${n(w)} x ${n(h)} in`
}

export const formatWeight = (lb: number | null | undefined): string =>
  lb == null ? 'Not published' : `${Number.isInteger(lb) ? lb : lb.toFixed(1)} lb`
