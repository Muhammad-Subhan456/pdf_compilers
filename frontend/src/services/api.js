async function readJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function mergePdfs({ files, blobUrls, filename }) {
  if (blobUrls?.length) {
    const response = await fetch('/api/pdf/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: blobUrls, filename }),
    })
    const data = await readJson(response)
    if (!response.ok || !data?.success) {
      throw Object.assign(new Error(data?.error?.code || 'PDF_PROCESSING_FAILED'), {
        code: data?.error?.code || 'PDF_PROCESSING_FAILED',
      })
    }
    return data
  }

  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  if (filename) form.append('filename', filename)

  const response = await fetch('/api/pdf/merge', {
    method: 'POST',
    body: form,
  })
  const data = await readJson(response)
  if (!response.ok || !data?.success) {
    throw Object.assign(new Error(data?.error?.code || 'PDF_PROCESSING_FAILED'), {
      code: data?.error?.code || 'PDF_PROCESSING_FAILED',
    })
  }
  return data
}

export async function trimPdf({ file, blobUrl, startPage, endPage, filename }) {
  if (blobUrl) {
    const response = await fetch('/api/pdf/trim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: blobUrl,
        start_page: startPage,
        end_page: endPage,
        filename,
      }),
    })
    const data = await readJson(response)
    if (!response.ok || !data?.success) {
      throw Object.assign(new Error(data?.error?.code || 'PDF_PROCESSING_FAILED'), {
        code: data?.error?.code || 'PDF_PROCESSING_FAILED',
      })
    }
    return data
  }

  const form = new FormData()
  form.append('file', file)
  form.append('start_page', String(startPage))
  form.append('end_page', String(endPage))
  if (filename) form.append('filename', filename)

  const response = await fetch('/api/pdf/trim', {
    method: 'POST',
    body: form,
  })
  const data = await readJson(response)
  if (!response.ok || !data?.success) {
    throw Object.assign(new Error(data?.error?.code || 'PDF_PROCESSING_FAILED'), {
      code: data?.error?.code || 'PDF_PROCESSING_FAILED',
    })
  }
  return data
}

export async function triggerDownload(url, filename) {
  const response = await fetch(url)
  if (!response.ok) {
    throw Object.assign(new Error('PDF_PROCESSING_FAILED'), { code: 'PDF_PROCESSING_FAILED' })
  }
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}
