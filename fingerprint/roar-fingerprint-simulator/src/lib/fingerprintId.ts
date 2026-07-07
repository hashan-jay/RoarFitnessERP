/** Generates a unique simulated fingerprint template ID (PIN) for one person. */
export function generateFingerprintTemplateId(
  kind: 'member' | 'instructor',
  personId: number
): string {
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  const prefix = kind === 'member' ? 'MEM' : 'INS';
  return `RF-FP-${prefix}-${personId}-${suffix}`;
}

export function formatPinDisplay(templateId: string): string {
  return templateId.replace(/^RF-FP-/, '');
}
