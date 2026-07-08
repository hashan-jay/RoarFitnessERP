/** Deterministic member ID from email — replace with backend-issued ID later */
export function buildMemberId(email: string): string {
  let hash = 0
  const normalized = email.trim().toLowerCase()
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0
  }
  const sequence = String(hash % 10_000_000).padStart(7, '0')
  return `RFMEM${sequence}`
}
