import { describe, expect, it } from 'vitest'
import { hasStorageCapacity, isOwnedPaoImageCustomId, isPaoCode, paoImageCustomId, permittedStorageBytes } from '../paoImageLimits'

describe('PAO image storage limits', () => {
  it('accepts only two-digit PAO codes', () => {
    expect(isPaoCode('00')).toBe(true)
    expect(isPaoCode('99')).toBe(true)
    expect(isPaoCode('9')).toBe(false)
    expect(isPaoCode('AA')).toBe(false)
  })

  it('creates legacy and unique identities scoped to a user and number', () => {
    expect(paoImageCustomId('user-123', '07')).toBe('loci-user-123-07')
    expect(paoImageCustomId('user-123', '07', 'fresh')).toBe('loci-user-123-07-fresh')
    expect(isOwnedPaoImageCustomId('loci-user-123-07-fresh', 'user-123', '07')).toBe(true)
    expect(isOwnedPaoImageCustomId('loci-other-user-07-fresh', 'user-123', '07')).toBe(false)
    expect(isOwnedPaoImageCustomId('loci-user-123-08-fresh', 'user-123', '07')).toBe(false)
  })

  it('reserves a quarter of provider capacity and caps Loci at 1.5 GB', () => {
    const twoGigabytes = 2 * 1024 * 1024 * 1024
    expect(permittedStorageBytes(twoGigabytes)).toBe(Math.floor(1.5 * 1024 * 1024 * 1024))
    expect(hasStorageCapacity(100, 50, 200)).toBe(true)
    expect(hasStorageCapacity(101, 50, 200)).toBe(false)
  })
})
