let blobModeCache = null

export async function getStorageMode() {
  if (blobModeCache) return blobModeCache
  try {
    const response = await fetch('/api/blob/status')
    const data = await response.json()
    blobModeCache = data?.blobEnabled ? 'blob' : 'local'
  } catch {
    blobModeCache = 'local'
  }
  return blobModeCache
}

export async function uploadPdfs(files) {
  const mode = await getStorageMode()
  if (mode !== 'blob') {
    return { mode: 'local', files: Array.from(files) }
  }

  const { upload } = await import('@vercel/blob/client')
  const uploaded = []
  for (const file of files) {
    const blob = await upload(`uploads/${file.name}`, file, {
      access: 'public',
      handleUploadUrl: '/api/blob/token',
    })
    uploaded.push({ url: blob.url, name: file.name })
  }
  return { mode: 'blob', files: uploaded }
}
