const UNSAFE = /[<>:"/\\|?*\u0000-\u001f]/g

export function sanitizeFilename(raw, fallback = 'crafted-document') {
  let name = String(raw || '').trim()
  name = name.replace(UNSAFE, '')
  name = name.replace(/\.\.+/g, '.')
  name = name.replace(/^\.+/, '')
  name = name.replace(/\.pdf$/i, '')
  name = name.replace(/\s+/g, ' ').trim()
  if (!name) name = fallback
  return `${name.slice(0, 180)}.pdf`
}

export function stripPdfExtension(name) {
  return String(name || '').replace(/\.pdf$/i, '')
}
