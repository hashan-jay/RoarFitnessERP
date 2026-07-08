export function downloadHtmlBill(filename: string, html: string) {
  const blob = new Blob(
    [
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${filename}</title>`,
      '<style>',
      'body{font-family:Arial,sans-serif;padding:24px;color:#111;}',
      'table{width:100%;border-collapse:collapse;margin:16px 0;}',
      'th,td{border:1px solid #ddd;padding:8px;text-align:left;}',
      'h1{margin:0 0 8px;}',
      '.meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:16px 0;}',
      '.meta div{display:flex;justify-content:space-between;gap:12px;}',
      '.total{font-size:1.1rem;font-weight:700;margin-top:16px;}',
      '</style></head><body>',
      html,
      '</body></html>',
    ],
    { type: 'text/html;charset=utf-8' },
  )
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename.endsWith('.html') ? filename : `${filename}.html`
  anchor.click()
  URL.revokeObjectURL(url)
}
