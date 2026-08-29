/**
 * Splits a SQL file into statements, respecting single-quoted string literals
 * (including '' escapes) and -- line comments. A naive split on ';' corrupts
 * any statement containing a semicolon inside a string, which this seed does.
 */
export function splitSql(sql) {
  const out = []
  let buf = ''
  let inStr = false
  let inComment = false
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i]
    const next = sql[i + 1]
    if (inComment) {
      if (c === '\n') { inComment = false; buf += c }
      continue
    }
    if (!inStr && c === '-' && next === '-') { inComment = true; i++; continue }
    if (c === "'") {
      if (inStr && next === "'") { buf += "''"; i++; continue }
      inStr = !inStr
      buf += c
      continue
    }
    if (c === ';' && !inStr) { const t = buf.trim(); if (t) out.push(t); buf = ''; continue }
    buf += c
  }
  const tail = buf.trim()
  if (tail) out.push(tail)
  return out
}
