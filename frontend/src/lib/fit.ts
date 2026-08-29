/**
 * Orientation-insensitive fit check.
 *
 * Mirrors `fitsWithin` in api/src/fees.ts so the size checker and the airline
 * pages give the same verdict the fee engine does. Kept as a small local copy
 * rather than a shared package: it is six lines of pure arithmetic, and the
 * engine's copy is the one under test in api/test/fees.test.ts.
 */

export interface Box {
  length: number | null
  width: number | null
  height: number | null
}

const EPSILON = 1e-9

/** True when `bag` fits inside `limit` in some orientation. Null when unknown. */
export function fitsWithin(bag: Box, limit: Box): boolean | null {
  const sides = (b: Box): number[] | null => {
    const { length, width, height } = b
    if (length == null || width == null || height == null) return null
    const values = [length, width, height]
    if (values.some((n) => !Number.isFinite(n) || n <= 0)) return null
    return values.sort((a, z) => z - a)
  }
  const a = sides(bag)
  const l = sides(limit)
  if (!a || !l) return null
  return a.every((value, i) => value <= l[i] + EPSILON)
}
