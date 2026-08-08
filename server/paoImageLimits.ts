export const MAX_STORED_IMAGE_BYTES = 384 * 1024
export const STORAGE_RESERVE_RATIO = 0.25
export const ABSOLUTE_APP_LIMIT_BYTES = Math.floor(1.5 * 1024 * 1024 * 1024)

export function isPaoCode(code: string): boolean {
  return /^\d{2}$/.test(code) && Number(code) <= 99
}

export function paoImageCustomId(uid: string, code: string): string {
  return `loci-${uid}-${code}`
}

export function permittedStorageBytes(providerLimitBytes: number): number {
  return Math.min(ABSOLUTE_APP_LIMIT_BYTES, Math.floor(providerLimitBytes * (1 - STORAGE_RESERVE_RATIO)))
}

export function hasStorageCapacity(totalBytes: number, incomingBytes: number, providerLimitBytes: number): boolean {
  return totalBytes + incomingBytes <= permittedStorageBytes(providerLimitBytes)
}
