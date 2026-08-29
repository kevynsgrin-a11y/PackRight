import test from 'node:test'
import assert from 'node:assert/strict'

import { ApiError, parseCalculationRequest, readJsonBody } from '../src/validate.ts'

const valid = {
  airlineId: 'aa',
  fareFamilyId: 'aa-main',
  passengers: [{ id: 'pax-1', benefitIds: [], bags: [{ type: 'checked', weight: 40, dimensions: null }] }],
}

/** Narrows an unknown thrown value to ApiError, failing the test otherwise. */
const asApiError = (err: unknown): ApiError => {
  if (!(err instanceof ApiError)) {
    assert.fail(`expected an ApiError, got ${String(err)}`)
  }
  return err
}

const expectApiError = (fn: () => unknown, code: string, status: number): ApiError => {
  try {
    fn()
  } catch (thrown) {
    const err = asApiError(thrown)
    assert.equal(err.code, code)
    assert.equal(err.status, status)
    return err
  }
  assert.fail(`expected ${code} to be thrown`)
}

test('a well-formed request is accepted and normalised', () => {
  const parsed = parseCalculationRequest(valid)
  assert.equal(parsed.airlineId, 'aa')
  assert.equal(parsed.passengers.length, 1)
  assert.equal(parsed.passengers[0].bags[0].type, 'checked')
})

test('missing core fields return the documented 400 message', () => {
  const err = expectApiError(() => parseCalculationRequest({ airlineId: 'aa' }), 'INVALID_REQUEST', 400)
  assert.equal(err.message, 'airlineId, fareFamilyId, and passengers are required.')
  assert.deepEqual(err.toBody().error.code, 'INVALID_REQUEST')
})

test('a non-object body is rejected as INVALID_REQUEST', () => {
  expectApiError(() => parseCalculationRequest('nope'), 'INVALID_REQUEST', 400)
  expectApiError(() => parseCalculationRequest(null), 'INVALID_REQUEST', 400)
  expectApiError(() => parseCalculationRequest([1, 2, 3]), 'INVALID_REQUEST', 400)
})

test('an unknown bag type is rejected with a field-level detail', () => {
  const err = expectApiError(
    () =>
      parseCalculationRequest({
        ...valid,
        passengers: [{ id: 'p', benefitIds: [], bags: [{ type: 'trunk', weight: 1, dimensions: null }] }],
      }),
    'INVALID_REQUEST',
    400,
  )
  assert.ok(err.details?.some((d: { field: string }) => d.field === 'passengers[0].bags[0].type'))
})

test('out-of-range numbers are rejected', () => {
  expectApiError(
    () =>
      parseCalculationRequest({
        ...valid,
        passengers: [{ id: 'p', benefitIds: [], bags: [{ type: 'checked', weight: 99999, dimensions: null }] }],
      }),
    'INVALID_REQUEST',
    400,
  )
  expectApiError(
    () =>
      parseCalculationRequest({
        ...valid,
        passengers: [
          { id: 'p', benefitIds: [], bags: [{ type: 'checked', weight: 10, dimensions: { length: 999, width: 1, height: 1 } }] },
        ],
      }),
    'INVALID_REQUEST',
    400,
  )
})

test('NaN and Infinity are rejected rather than propagated into the estimate', () => {
  expectApiError(
    () =>
      parseCalculationRequest({
        ...valid,
        passengers: [{ id: 'p', benefitIds: [], bags: [{ type: 'checked', weight: Number.NaN, dimensions: null }] }],
      }),
    'INVALID_REQUEST',
    400,
  )
})

test('too many passengers is rejected', () => {
  expectApiError(
    () =>
      parseCalculationRequest({
        ...valid,
        passengers: Array.from({ length: 25 }, (_, i) => ({ id: `p${i}`, benefitIds: [], bags: [] })),
      }),
    'INVALID_REQUEST',
    400,
  )
})

test('an empty passenger list is rejected', () => {
  expectApiError(() => parseCalculationRequest({ ...valid, passengers: [] }), 'INVALID_REQUEST', 400)
})

test('missing passenger ids are filled in deterministically', () => {
  const parsed = parseCalculationRequest({
    ...valid,
    passengers: [{ benefitIds: [], bags: [] }, { benefitIds: [], bags: [] }],
  })
  assert.deepEqual(parsed.passengers.map((p) => p.id), ['pax-1', 'pax-2'])
})

test('malformed JSON returns 400 INVALID_JSON without echoing the parser message', async () => {
  const request = new Request('https://example.test/api/v1/calculate-fees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"airlineId": ',
  })
  await assert.rejects(
    () => readJsonBody(request),
    (thrown: unknown) => {
      const err = asApiError(thrown)
      assert.equal(err.status, 400)
      assert.equal(err.code, 'INVALID_JSON')
      assert.equal(err.message, 'Request body is not valid JSON.')
      // The audit found a raw parser message leaking to callers.
      assert.doesNotMatch(err.message, /JSON\.parse|Unexpected token|position \d+/)
      return true
    },
  )
})

test('an empty body returns the documented required-fields message', async () => {
  const request = new Request('https://example.test/api/v1/calculate-fees', { method: 'POST', body: '' })
  await assert.rejects(
    () => readJsonBody(request),
    (thrown: unknown) => {
      const err = asApiError(thrown)
      assert.equal(err.code, 'INVALID_REQUEST')
      assert.equal(err.message, 'airlineId, fareFamilyId, and passengers are required.')
      return true
    },
  )
})

test('an oversized body is rejected with 413 before it is parsed', async () => {
  const request = new Request('https://example.test/api/v1/calculate-fees', {
    method: 'POST',
    headers: { 'content-length': String(10 * 1024 * 1024) },
    body: '{}',
  })
  await assert.rejects(
    () => readJsonBody(request),
    (thrown: unknown) => {
      const err = asApiError(thrown)
      assert.equal(err.status, 413)
      assert.equal(err.code, 'PAYLOAD_TOO_LARGE')
      return true
    },
  )
})

test('the error envelope matches the documented shape', () => {
  const err = new ApiError(400, 'INVALID_REQUEST', 'airlineId, fareFamilyId, and passengers are required.')
  assert.deepEqual(err.toBody(), {
    error: { code: 'INVALID_REQUEST', message: 'airlineId, fareFamilyId, and passengers are required.' },
  })
})
