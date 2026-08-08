import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const styles = readFileSync(new URL('../../src/App.css', import.meta.url), 'utf8')

describe('PAO visual anchor styles', () => {
  it('shows the complete source image in the large portrait preview', () => {
    expect(styles).toMatch(/\.memory-portrait\s*>\s*\.portrait-image\s*\{[^}]*object-fit:\s*contain;/s)
  })
})
