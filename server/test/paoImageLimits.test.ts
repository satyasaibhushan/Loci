import { describe, expect, it } from 'vitest'
import { hasStorageCapacity, isPaoCode, paoImageCustomId, permittedStorageBytes } from '../paoImageLimits'

describe('PAO image storage limits', () => {
  it('accepts only two-digit PAO codes', () => {
    expect(isPaoCode('00')).toBe(true)
    expect(isPaoCode('99')).toBe(true)
    expect(isPaoCode('9')).toBe(false)
    expect(isPaoCode('AA')).toBe(false)
  })

  it('uses an authenticated user and number as the replacement key', () => {
    expect(paoImageCustomId('user-123', '07')).toBe('loci-user-123-07')
  })

  it('reserves a quarter of provider capacity and caps Loci at 1.5 GB', () => {
    const twoGigabytes = 2 * 1024 * 1024 * 1024
    expect(permittedStorageBytes(twoGigabytes)).toBe(Math.floor(1.5 * 1024 * 1024 * 1024))
    expect(hasStorageCapacity(100, 50, 200)).toBe(true)
    expect(hasStorageCapacity(101, 50, 200)).toBe(false)
  })
})
