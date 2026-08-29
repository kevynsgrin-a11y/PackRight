/**
 * Drives the real Hono app through app.fetch, because several defects only
 * appear once middleware, handler and error paths compose: a 429 that inherited
 * the handler's cache directive, a limiter that ran after the query it was
 * meant to prevent, and error replies that shipped with no security headers.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import app from '../src/index.ts'
import { RATE_LIMIT, __resetRateLimitForTests } from '../src/http.ts'
import { ApiError, readJsonBody } from '../src/validate.ts'

/** Minimal D1 stand-in that counts how many statements the app prepares. */
function stubDb() {
  const state = { prepared: 0 }
  const stmt = {
    bind: () => stmt,
    all: async () => ({ results: [] }),
    first: async () => ({ n: 0 }),
    run: async () => ({ success: true }),
  }
  return {
    state,
    env: {
      DB: {
        prepare: (_sql: string) => {
          state.prepared += 1
          return stmt
        },
      },
    } as never,
  }
}

const get = (path: string, ip: string) =>
  new Request(`https://api.test${path}`, { headers: { 'cf-connecting-ip': ip } })

test('a rate-limited request is not cacheable and is not doubly typed', async () => {
  __resetRateLimitForTests()
  const db = stubDb()
  const ip = '203.0.113.10'

  let last: Response | undefined
  for (let i = 0; i < RATE_LIMIT.limit + 1; i++) {
    last = await app.fetch(get('/api/v1/reference', ip), db.env)
  }

  assert.equal(last?.status, 429)
  // The handler sets 'public, max-age=3600'. Before the fix that directive
  // survived onto the 429, so a shared cache could have stored a rate-limit
  // response and served it to unrelated callers.
  assert.equal(last?.headers.get('cache-control'), 'no-store')
  assert.equal(last?.headers.get('content-type'), 'application/json')
  assert.ok(last?.headers.get('retry-after'), 'Retry-After must be present')
  assert.equal(last?.headers.get('x-content-type-options'), 'nosniff')
  assert.ok(last?.headers.get('ratelimit-remaining'), 'RateLimit-* must be present')
})

test('a rate-limited request sheds load instead of querying the database', async () => {
  __resetRateLimitForTests()
  const db = stubDb()
  const ip = '203.0.113.11'

  for (let i = 0; i < RATE_LIMIT.limit; i++) {
    await app.fetch(get('/api/v1/reference', ip), db.env)
  }
  const before = db.state.prepared
  const blocked = await app.fetch(get('/api/v1/reference', ip), db.env)

  assert.equal(blocked.status, 429)
  // The point of a limiter is to shed work. Running the handler first and
  // rewriting the response afterwards shed none of it.
  assert.equal(db.state.prepared, before, 'a 429 must issue no D1 statements')
})

// Guard, not a repair. The audit predicted that a handler throwing ApiError
// would unwind past the middleware's post-next() header block. It does not:
// Hono's compose catches the throw in the handler's own dispatch frame and runs
// onError there, so next() resolves normally and the headers were always
// applied. This pins that behaviour so a future refactor cannot quietly lose it.
test('an error reply still carries the security and rate-limit headers', async () => {
  __resetRateLimitForTests()
  const db = stubDb()
  const bad = new Request('https://api.test/api/v1/calculate-fees', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.12' },
    body: JSON.stringify({}),
  })
  const res = await app.fetch(bad, db.env)

  assert.equal(res.status, 400)
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(res.headers.get('x-frame-options'), 'DENY')
  assert.ok(res.headers.get('x-api-version'), 'X-API-Version must be present on errors')
  assert.ok(res.headers.get('ratelimit-limit'), 'RateLimit-* must be present on errors')
  assert.equal(res.headers.get('cache-control'), 'no-store')
})

test('an oversized body stops being read rather than being buffered whole', async () => {
  // A chunked request carries no content-length, so the size check can only
  // come from the stream itself. The old code buffered the entire body first
  // and measured afterwards: it did reject, but only after holding all of it in
  // memory -- which is the half of the cap that actually protects the isolate.
  const CHUNK = 4096
  const CHUNKS = 32 // 128 KiB, four times the cap
  let produced = 0
  let cancelled = false
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (produced >= CHUNKS) {
        controller.close()
        return
      }
      produced += 1
      controller.enqueue(new Uint8Array(CHUNK).fill(0x61))
    },
    cancel() {
      cancelled = true
    },
  })
  const request = new Request('https://api.test/api/v1/calculate-fees', {
    method: 'POST',
    body: stream,
    // @ts-expect-error duplex is required for a stream body and is not in the DOM lib
    duplex: 'half',
  })

  await assert.rejects(
    () => readJsonBody(request),
    (thrown: unknown) => {
      assert.ok(thrown instanceof ApiError)
      assert.equal(thrown.status, 413)
      assert.equal(thrown.code, 'PAYLOAD_TOO_LARGE')
      return true
    },
  )
  assert.ok(cancelled, 'the reader must be cancelled, not drained')
  assert.ok(
    produced * CHUNK < CHUNKS * CHUNK,
    `the whole body was still pulled (${produced * CHUNK} bytes)`,
  )
})

test('the cap counts bytes, not UTF-16 code units', async () => {
  // 32,002 code units of a 2-byte character is ~64 KB -- twice the cap. The
  // old String.length check read it as just over 32,000 and let it through.
  const body = 'é'.repeat(1) + 'é'.repeat(32_001)
  const request = new Request('https://api.test/api/v1/calculate-fees', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  })
  await assert.rejects(
    () => readJsonBody(request),
    (thrown: unknown) => {
      assert.ok(thrown instanceof ApiError)
      assert.equal(thrown.status, 413)
      return true
    },
  )
})
