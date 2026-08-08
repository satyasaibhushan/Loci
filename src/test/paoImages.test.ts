import { describe, expect, it } from 'vitest'
import { imageDimensions, validateImageUrl } from '../lib/paoImages'

describe('PAO image helpers', () => {
  it('scales large images without changing their aspect ratio', () => {
    expect(imageDimensions(1600, 1200)).toEqual({ width: 800, height: 600 })
    expect(imageDimensions(400, 600)).toEqual({ width: 400, height: 600 })
  })

  it('accepts web image addresses and rejects unsafe or partial values', () => {
    expect(validateImageUrl('https://images.example.com/thor.webp')).toBe('https://images.example.com/thor.webp')
    expect(validateImageUrl('javascript:alert(1)')).toBeUndefined()
    expect(validateImageUrl('images/thor.webp')).toBeUndefined()
  })
})
