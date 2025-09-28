import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { getUrl, list, remove, uploadData } from 'aws-amplify/storage'
import { buildCdnUrl } from '@/lib/utils'

type StoredImage = {
  path: string
  url?: string
  thumbUrl?: string
  fullPath?: string
  thumbPath?: string
  size?: number
  lastModified?: Date
  width?: number
  height?: number
}

// Use path-based APIs. 'public/' corresponds to guest-accessible objects.
const DEFAULT_PREFIX = 'public/photos/'

export default function PhotoManager() {
  const [images, setImages] = useState<StoredImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  // Path-based API does not require accessLevel; it is part of the path prefix.

  const [section, setSection] = useState<'photos' | 'restaurant' | 'bar' | 'rooms' | 'events'>('photos')
  const prefix = useMemo(() => `public/${section}/`, [section])

  async function refresh() {
    try {
      const { items } = await list({ path: prefix })
      const sorted = items
        .filter(i => i.path && !i.path.endsWith('/') && !i.path.includes('/thumbs/'))
        .map(i => ({ path: i.path!, size: i.size, lastModified: i.lastModified }))
        .sort((a, b) => (b.lastModified?.getTime() || 0) - (a.lastModified?.getTime() || 0))

      // parallel fetch URLs (presigned)
      const withUrls = await Promise.all(
        sorted.map(async (it) => {
          // Prefer server-generated webp if present; otherwise use original
          const lastSlash = it.path.lastIndexOf('/')
          const dir = it.path.substring(0, lastSlash + 1) // includes trailing /
          const baseNoExt = it.path.substring(lastSlash + 1).replace(/\.[^.]+$/, '')
          const webpFullPath = `${dir}${baseNoExt}.webp`
          const webpThumbPath = `${dir}thumbs/${baseNoExt}.webp`
          let chosenFullPath = it.path
          let chosenThumbPath: string | undefined
          try {
            const full = await getUrl({ path: webpFullPath, options: { expiresIn: 60 * 60 } })
            chosenFullPath = webpFullPath
            try {
              const thumb = await getUrl({ path: webpThumbPath, options: { expiresIn: 60 * 60 } })
              chosenThumbPath = webpThumbPath
              return { ...it, path: it.path, url: full.url.toString(), thumbUrl: thumb.url.toString(), fullPath: chosenFullPath, thumbPath: chosenThumbPath }
            } catch {
              return { ...it, path: it.path, url: full.url.toString(), fullPath: chosenFullPath }
            }
          } catch {
            try {
              const fullOrig = await getUrl({ path: it.path, options: { expiresIn: 60 * 60 } })
              return { ...it, url: fullOrig.url.toString(), fullPath: chosenFullPath }
            } catch {
              return it
            }
          }
        })
      )
  setImages(withUrls)
    } catch (err) {
      console.error('Failed to list images', err)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onUploadChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const base = file.name.replace(/\s+/g, '_').replace(/\.[^.]+$/, '')
        const stamp = Date.now()
  const fullPath = `${prefix}${stamp}_${base}.webp`
  const thumbPath = `${prefix}thumbs/${stamp}_${base}.webp`

        // Resize and convert to WebP
        const fullBlob = await resizeToWebp(file, 1600, 0.85)
        const thumbBlob = await resizeToWebp(file, 400, 0.8)

        setProgressMap((m) => ({ ...m, [fullPath]: 0, [thumbPath]: 0 }))

  await uploadData({
          path: fullPath,
          data: fullBlob,
          options: {
            contentType: 'image/webp',
            onProgress: ({ transferredBytes, totalBytes }) => {
              if (!totalBytes) return
              setProgressMap((m) => ({ ...m, [fullPath]: Math.round((transferredBytes / totalBytes) * 100) }))
            },
          },
        }).result

  await uploadData({
          path: thumbPath,
          data: thumbBlob,
          options: {
            contentType: 'image/webp',
            onProgress: ({ transferredBytes, totalBytes }) => {
              if (!totalBytes) return
              setProgressMap((m) => ({ ...m, [thumbPath]: Math.round((transferredBytes / totalBytes) * 100) }))
            },
          },
        }).result
      }
      await refresh()
      e.target.value = ''
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  async function onDelete(path: string) {
    try {
      // remove the exact path
      try { await remove({ path }) } catch {}
      // also remove webp full variant in same dir
      const lastSlash = path.lastIndexOf('/')
      const dir = path.substring(0, lastSlash + 1)
      const baseNoExt = path.substring(lastSlash + 1).replace(/\.[^.]+$/, '')
      const webpFull = `${dir}${baseNoExt}.webp`
      try { await remove({ path: webpFull }) } catch {}
      // and the webp thumb variant
      const webpThumb = `${dir}thumbs/${baseNoExt}.webp`
      try { await remove({ path: webpThumb }) } catch {}
      setImages((arr) => arr.filter((i) => i.path !== path))
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    // Reuse input handler logic
    const input = { target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>
    await onUploadChange(input)
  }, [])

  async function moveToSection(img: StoredImage) {
    const sections: Array<StoredImage['path']> = ['photos', 'restaurant', 'bar', 'rooms', 'events'] as any
    const current = section
    const target = prompt(`Move to section (${sections.join(', ')}):`, current)
    if (!target || !sections.includes(target as any) || target === current) return
    const baseName = img.path.split('/').pop()!
    const newFull = `public/${target}/${baseName}`
    const newThumb = `public/${target}/thumbs/${baseName}`
    try {
      // Download and re-upload (v6 path API has no direct copy yet)
      const fullResp = await fetch(img.url || '')
      const fullBlob = await fullResp.blob()
  await uploadData({ path: newFull, data: fullBlob, options: { contentType: 'image/webp' } }).result
      if (img.thumbUrl) {
        const tResp = await fetch(img.thumbUrl)
        const tBlob = await tResp.blob()
  await uploadData({ path: newThumb, data: tBlob, options: { contentType: 'image/webp' } }).result
      }
      await onDelete(img.path)
      await refresh()
    } catch (e) {
      console.error('Move failed', e)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600">Section</label>
          <select
            className="border border-slate-300 rounded px-2 py-1 text-sm"
            value={section}
            onChange={(e) => setSection(e.target.value as any)}
          >
            <option value="photos">General</option>
            <option value="restaurant">Restaurant</option>
            <option value="bar">Bar</option>
            <option value="rooms">Rooms</option>
            <option value="events">Events</option>
          </select>
        </div>
        <label className="inline-flex items-center gap-3">
          <span className="px-4 py-2 rounded-lg bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 transition-colors cursor-pointer">Upload photos</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onUploadChange}
            className="hidden"
          />
        </label>
        <button
          onClick={refresh}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-50"
          disabled={uploading}
        >
          Refresh
        </button>
      </div>

      {/* Drag-and-drop zone (mobile-safe: taps fall back to button above) */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-600 hover:border-yellow-500 transition-colors"
      >
        Drag & drop images here (or use the Upload button)
      </div>

  {Object.keys(progressMap).length > 0 && (
        <div className="space-y-2">
          {Object.entries(progressMap).map(([k, p]) => (
            <div key={k} className="text-xs text-slate-600">
      <div className="flex justify-between"><span className="truncate max-w-[70%]">{k.replace(prefix, '')}</span><span>{p}%</span></div>
              <div className="h-2 bg-slate-200 rounded"><div className="h-2 bg-yellow-500 rounded" style={{ width: `${p}%` }} /></div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {images.map((img) => (
          <div key={img.path} className="group relative border border-slate-200 rounded overflow-hidden bg-white">
      {img.thumbUrl || img.url ? (
              <img
        src={buildCdnUrl(img.thumbPath || img.fullPath || '') || img.thumbUrl || img.url}
                alt={img.path}
                className="w-full h-28 sm:h-36 md:h-40 object-cover"
                loading="lazy"
                onLoad={(e) => {
                  const el = e.currentTarget
                  const [w, h] = [el.naturalWidth, el.naturalHeight]
                  setImages((arr) => arr.map(a => a.path === img.path ? { ...a, width: w, height: h } : a))
                }}
              />
            ) : (
              <div className="w-full h-28 sm:h-32 flex items-center justify-center text-slate-400 text-sm">No preview</div>
            )}
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
        href={buildCdnUrl(img.fullPath || '') || img.url}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-1 text-xs rounded bg-black/60 text-white"
              >Open</a>
              <button
        onClick={() => navigator.clipboard.writeText((buildCdnUrl(img.fullPath || '') || img.url || ''))}
                className="px-2 py-1 text-xs rounded bg-black/60 text-white"
              >Copy</button>
              <button
                onClick={() => moveToSection(img)}
                className="px-2 py-1 text-xs rounded bg-blue-600 text-white"
              >Move</button>
              <button
                onClick={() => onDelete(img.path)}
                className="px-2 py-1 text-xs rounded bg-red-600 text-white"
              >Del</button>
            </div>
            <div className="p-2 text-[10px] text-slate-600 truncate">
              <div className="truncate">{img.path.replace(prefix, '')}</div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-slate-400">{img.width && img.height ? `${img.width}×${img.height}` : ''}</span>
                <span className="text-slate-400">{typeof img.size === 'number' ? formatBytes(img.size) : ''}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

async function resizeToWebp(file: File, maxWidth: number, quality: number): Promise<Blob> {
  const img = await loadImage(file)
  const ratio = img.width > maxWidth ? maxWidth / img.width : 1
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.width * ratio))
  canvas.height = Math.max(1, Math.round(img.height * ratio))
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/webp', quality))
  return blob
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = reject
    img.src = url
  })
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}
