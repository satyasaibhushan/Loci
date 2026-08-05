import { describe, expect, it } from 'vitest'
import { pairToSound } from '../data/majorSystem'
import { chunkDigits } from '../data/pi'

describe('Major System helpers', () => {
  it('turns a two-digit code into its primary sounds', () => {
    expect(pairToSound('14')).toBe('T · R')
    expect(pairToSound('06')).toBe('S · J')
  })

  it('preserves a leading zero', () => {
    expect(pairToSound('0')).toBe('S · S')
  })

  it('splits digits without dropping a partial final chunk', () => {
    expect(chunkDigits('14159265')).toEqual(['141592', '65'])
  })
})
