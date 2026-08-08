import { getFirebaseServices, isFirebaseConfigured } from './firebase'
import type { AppUser } from '../types'

const MAX_SOURCE_BYTES = 12 * 1024 * 1024
const MAX_IMAGE_EDGE = 800
const TARGET_IMAGE_BYTES = 300 * 1024
const MAX_STORED_IMAGE_BYTES = 384 * 1024
const QUALITY_STEPS = [0.82, 0.72, 0.62, 0.52]
const EDGE_STEPS = [800, 680, 560, 480, 400]

export interface StoredPaoImage {
  imageUrl: string
  imageProvider: 'uploadthing'
  imageCustomId?: string
}

export function imageDimensions(width: number, height: number, maxEdge = MAX_IMAGE_EDGE): { width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

export function validateImageUrl(value: string): string | undefined {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined
  } catch {
    return undefined
  }
}

function validateImageFile(file: File): void {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
  if (file.size > MAX_SOURCE_BYTES) throw new Error('That image is over 12 MB. Choose a smaller one.')
}

async function loadImage(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file)
    return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() }
  }

  const url = URL.createObjectURL(file)
  const image = new Image()
  image.decoding = 'async'
  image.src = url
  await image.decode()
  return { source: image, width: image.naturalWidth, height: image.naturalHeight, close: () => URL.revokeObjectURL(url) }
}

function canvasToWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new Error('This browser could not compress the image.')),
    'image/webp',
    quality,
  ))
}

export async function compressPaoImage(file: File): Promise<Blob> {
  validateImageFile(file)
  const loaded = await loadImage(file)
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('This browser cannot prepare the image.')
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'

    let smallest: Blob | undefined
    for (const maxEdge of EDGE_STEPS) {
      const dimensions = imageDimensions(loaded.width, loaded.height, maxEdge)
      canvas.width = dimensions.width
      canvas.height = dimensions.height
      context.drawImage(loaded.source, 0, 0, dimensions.width, dimensions.height)

      for (const quality of QUALITY_STEPS) {
        const candidate = await canvasToWebp(canvas, quality)
        if (!smallest || candidate.size < smallest.size) smallest = candidate
        if (candidate.size <= TARGET_IMAGE_BYTES) return candidate
      }
    }
    if (smallest && smallest.size <= MAX_STORED_IMAGE_BYTES) return smallest
    throw new Error('This image remains too detailed after compression. Choose a simpler or smaller image.')
  } finally {
    loaded.close()
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('The image could not be read.'))
    reader.readAsDataURL(blob)
  })
}

async function getAuthorizationHeader(): Promise<string> {
  const { auth } = await getFirebaseServices()
  const firebaseUser = auth.currentUser
  if (!firebaseUser) throw new Error('Sign in again before uploading an image.')
  return `Bearer ${await firebaseUser.getIdToken()}`
}

async function imageApiRequest(method: 'POST' | 'DELETE', code: string, image?: Blob, previousCustomId?: string): Promise<Response> {
  const headers = new Headers({ Authorization: await getAuthorizationHeader() })
  let body: FormData | undefined
  if (image) {
    body = new FormData()
    body.set('code', code)
    body.set('image', new File([image], `pao-${code}.webp`, { type: 'image/webp' }))
    if (previousCustomId) body.set('previousCustomId', previousCustomId)
  }
  const deleteParameters = new URLSearchParams({ code })
  if (previousCustomId) deleteParameters.set('customId', previousCustomId)
  const url = method === 'DELETE' ? `/api/pao-image?${deleteParameters}` : '/api/pao-image'
  return fetch(url, { method, headers, body })
}

export async function storePaoImage(user: AppUser, code: string, file: File, previousCustomId?: string): Promise<StoredPaoImage> {
  const image = await compressPaoImage(file)
  if (user.isDemo || !isFirebaseConfigured) {
    return { imageUrl: await blobToDataUrl(image), imageProvider: 'uploadthing' }
  }

  const response = await imageApiRequest('POST', code, image, previousCustomId)
  const result = await response.json() as { imageCustomId?: string; imageUrl?: string; error?: string }
  if (!response.ok || !result.imageUrl) throw new Error(result.error || 'The image could not be uploaded.')
  return { imageUrl: result.imageUrl, imageProvider: 'uploadthing', imageCustomId: result.imageCustomId }
}

export async function deletePaoImage(user: AppUser, code: string, imageCustomId?: string): Promise<void> {
  if (user.isDemo || !isFirebaseConfigured) return
  const response = await imageApiRequest('DELETE', code, undefined, imageCustomId)
  if (response.ok || response.status === 404) return
  const result = await response.json() as { error?: string }
  throw new Error(result.error || 'The stored image could not be deleted.')
}
