import { describe, expect, it } from 'vitest'
import { bearerToken } from '../firebaseAuth'

describe('Firebase bearer token parsing', () => {
  it('accepts bearer authorization and rejects other schemes', () => {
    expect(bearerToken('Bearer abc.def.ghi')).toBe('abc.def.ghi')
    expect(bearerToken('bearer token')).toBe('token')
    expect(bearerToken('Basic token')).toBeUndefined()
    expect(bearerToken(null)).toBeUndefined()
  })
})
