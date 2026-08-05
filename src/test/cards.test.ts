import { describe, expect, it } from 'vitest'
import { ALL_CARDS, shuffledDeck } from '../data/cards'

describe('card deck', () => {
  it('contains every unique playing card', () => {
    expect(ALL_CARDS).toHaveLength(52)
    expect(new Set(ALL_CARDS).size).toBe(52)
  })

  it('shuffles without losing or duplicating cards', () => {
    const deck = shuffledDeck(() => 0.42)
    expect(deck).toHaveLength(52)
    expect(new Set(deck)).toEqual(new Set(ALL_CARDS))
    expect(deck).not.toEqual(ALL_CARDS)
  })
})
