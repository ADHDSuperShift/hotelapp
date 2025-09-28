import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Build a public URL, preferring a CDN if VITE_CDN_URL is set
export function withCdn(url: string): string {
  try {
    const cdn = import.meta.env.VITE_CDN_URL as string | undefined
    if (!cdn) return url
    const u = new URL(url)
    // preserve path and query; ignore origin
    const base = cdn.endsWith('/') ? cdn.slice(0, -1) : cdn
    return `${base}${u.pathname}${u.search}`
  } catch {
    return url
  }
}

// Given a storage path (e.g., public/photos/img.webp), build a CDN URL if VITE_CDN_URL is set.
// Returns undefined if CDN not configured or path is empty.
export function buildCdnUrl(path: string | undefined): string | undefined {
  if (!path) return undefined
  const cdn = import.meta.env.VITE_CDN_URL as string | undefined
  if (!cdn) return undefined
  const base = cdn.endsWith('/') ? cdn.slice(0, -1) : cdn
  // S3 public files are addressed at root with their path
  return `${base}/${path.replace(/^\//, '')}`
}
