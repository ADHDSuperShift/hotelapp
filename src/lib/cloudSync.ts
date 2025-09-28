import { uploadData, downloadData, getUrl } from 'aws-amplify/storage'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore JS module
import awsExports from '@/aws-exports'
import type { Photo } from '@/types/photos'
import type { Room } from '@/types/rooms'

const ROOMS_KEY = 'content/rooms.json'
const PHOTOS_KEY = 'content/photos.json'

async function putJson(key: string, data: unknown) {
  const body = JSON.stringify(data)
  await (await uploadData({
    key,
    data: body,
    options: { contentType: 'application/json', accessLevel: 'guest' },
  })).result
}

async function getJson<T>(key: string): Promise<T | undefined> {
  try {
    const { body } = await (await downloadData({ key, options: { accessLevel: 'guest' } })).result as any
    const text = await body.text()
    return JSON.parse(text) as T
  } catch (e) {
    return undefined
  }
}

export async function uploadRoomsCloud(rooms: Room[]) {
  await putJson(ROOMS_KEY, rooms)
}
export async function downloadRoomsCloud(): Promise<Room[] | undefined> {
  return getJson<Room[]>(ROOMS_KEY)
}

export async function uploadPhotosCloud(photos: Photo[]) {
  await putJson(PHOTOS_KEY, photos)
}
export async function downloadPhotosCloud(): Promise<Photo[] | undefined> {
  return getJson<Photo[]>(PHOTOS_KEY)
}

function extOf(name: string) {
  const m = /\.[A-Za-z0-9]+$/.exec(name)
  return m ? m[0] : ''
}

function buildPublicUrl(key: string): string | undefined {
  try {
    const bucket = (awsExports as any).aws_user_files_s3_bucket
    const region = (awsExports as any).aws_user_files_s3_bucket_region || (awsExports as any).aws_project_region
    console.log('AWS Config:', { bucket, region, key })
    if (bucket && region) {
      // Objects uploaded with accessLevel 'guest' are under the 'public/' prefix
      const url = `https://${bucket}.s3.${region}.amazonaws.com/public/${key}`
      console.log('Built public URL:', url)
      return url
    }
    console.warn('Missing bucket or region in aws-exports')
  } catch (e) {
    console.error('Error building public URL:', e)
  }
  return undefined
}

export async function uploadImageToCloud(file: File): Promise<{ key: string; url: string }> {
  console.log('Uploading image to cloud:', file.name)
  const key = `content/images/${Date.now()}-${Math.random().toString(36).slice(2)}${extOf(file.name)}`
  
  try {
    await (await uploadData({ key, data: file, options: { accessLevel: 'guest', contentType: file.type || 'application/octet-stream' } })).result
    console.log('Upload successful, key:', key)
    
    const direct = buildPublicUrl(key)
    if (direct) {
      console.log('Using direct URL:', direct)
      return { key, url: direct }
    }
    
    // fallback to signed URL if bucket info missing
    console.log('Falling back to signed URL')
    const { url } = await getUrl({ key, options: { accessLevel: 'guest', expiresIn: 24 * 60 * 60 } })
    console.log('Signed URL:', url.toString())
    return { key, url: url.toString() }
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}
