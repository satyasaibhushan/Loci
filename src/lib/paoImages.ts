import { getFirebaseStorage, isFirebaseConfigured } from './firebase'
import type { AppUser } from '../types'

const MAX_SOURCE_BYTES = 12 * 1024 * 1024
const MAX_IMAGE_EDGE = 900
const OUTPUT_QUALITY = 0.82

export interface StoredPaoImage {
  imageUrl: string
  imagePath?: string
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

export async function compressPaoImage(file: File): Promise<Blob> {
  validateImageFile(file)
  const loaded = await loadImage(file)
  try {
    const dimensions = imageDimensions(loaded.width, loaded.height)
    const canvas = document.createElement('canvas')
    canvas.width = dimensions.width
    canvas.height = dimensions.height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('This browser cannot prepare the image.')
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(loaded.source, 0, 0, dimensions.width, dimensions.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', OUTPUT_QUALITY))
    if (!blob) throw new Error('This browser could not compress the image.')
    return blob
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

export async function storePaoImage(user: AppUser, code: string, file: File): Promise<StoredPaoImage> {
  const image = await compressPaoImage(file)
  if (user.isDemo || !isFirebaseConfigured) return { imageUrl: await blobToDataUrl(image) }

  const [storage, storageModule] = await Promise.all([getFirebaseStorage(), import('firebase/storage')])
  const imagePath = `users/${user.uid}/pao/${code}-${Date.now()}.webp`
  const imageRef = storageModule.ref(storage, imagePath)
  await storageModule.uploadBytes(imageRef, image, { contentType: 'image/webp', cacheControl: 'public,max-age=31536000,immutable' })
  return { imageUrl: await storageModule.getDownloadURL(imageRef), imagePath }
}

export async function deletePaoImage(user: AppUser, imagePath?: string): Promise<void> {
  if (!imagePath || user.isDemo || !isFirebaseConfigured) return
  const [storage, storageModule] = await Promise.all([getFirebaseStorage(), import('firebase/storage')])
  try {
    await storageModule.deleteObject(storageModule.ref(storage, imagePath))
  } catch (error) {
    if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'storage/object-not-found') throw error
  }
}
