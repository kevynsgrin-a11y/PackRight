/**
 * HTTP policy for the PackRight API: CORS scope, cache directives, rate limit
 * accounting, and security headers. Addresses audit issue P1-09 (no cache or
 * rate-limit headers, no versioned contract) and P1-13 (missing security
 * headers on the API origin).
 */

export const ALLOWED_ORIGINS = [
  'https://luggageliason.com',
  'https://www.luggageliason.com',
  'http://localhost:5173',
  'http://localhost:4173',
]

/** Reference GETs are public, cacheable, and safe to share at the edge. */
export const REFERENCE_CACHE_CONTROL = 'public, max-age=3600, stale-while-revalidate=86400'

/** Calculations reflect user input and must never be stored or shared. */
export const CALCULATION_CACHE_CONTROL = 'no-store'

export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Permissions-Policy':
    'geolocation=(), camera=(), microphone=(), payment=(), usb=(), browsing-topics=()',
  // The API returns JSON only; a restrictive policy costs nothing and blocks
  // any attempt to get a browser to treat a response as a document.
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
}

export const RATE_LIMIT = {
  /** Requests allowed per window, per client, per isolate. */
  limit: 120,
  windowSeconds: 60,
} as const

interface Bucket {
  count: number
  resetAt: number
}

/**
 * Best-effort rate limiting.
 *
 * Workers isolates do not share memory, so this bounds abuse from a single
 * client hitting a single isolate and supplies accurate RateLimit-* headers.
 * It is deliberately not presented as a durable global control: a Cloudflare
 * WAF rate-limiting rule, or a Durable Object, is the authoritative limiter.
 * See api/README.md.
 */
const buckets = new Map<string, Bucket>()

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetSeconds: number
}

export function consumeRateLimit(clientKey: string, now = Date.now()): RateLimitResult {
  const windowMs = RATE_LIMIT.windowSeconds * 1000
  let bucket = buckets.get(clientKey)

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs }
    buckets.set(clientKey, bucket)
  }

  // Opportunistic cleanup so the map cannot grow without bound in a long-lived isolate.
  if (buckets.size > 5000) {
    for (const [key, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(key)
    }
  }

  bucket.count += 1
  const resetSeconds = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000))
  const remaining = Math.max(0, RATE_LIMIT.limit - bucket.count)

  return {
    allowed: bucket.count <= RATE_LIMIT.limit,
    limit: RATE_LIMIT.limit,
    remaining,
    resetSeconds,
  }
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'RateLimit-Limit': String(result.limit),
    'RateLimit-Remaining': String(result.remaining),
    'RateLimit-Reset': String(result.resetSeconds),
    'RateLimit-Policy': `${result.limit};w=${RATE_LIMIT.windowSeconds}`,
  }
}

/** Resolves the CORS origin to echo, or null when the origin is not allowed. */
export function resolveCorsOrigin(origin: string | null | undefined): string | null {
  if (!origin) return null
  return ALLOWED_ORIGINS.includes(origin) ? origin : null
}

/** Identifies the caller for rate limiting. Falls back to a shared bucket. */
export function clientKeyFor(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}
