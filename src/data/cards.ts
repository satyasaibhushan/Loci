import type { CardEntry, CardId, Rank, Suit } from '../types'

export const SUITS: { id: Suit; name: string; symbol: string; color: 'red' | 'black' }[] = [
  { id: 'S', name: 'Spades', symbol: '♠', color: 'black' },
  { id: 'H', name: 'Hearts', symbol: '♥', color: 'red' },
  { id: 'D', name: 'Diamonds', symbol: '♦', color: 'red' },
  { id: 'C', name: 'Clubs', symbol: '♣', color: 'black' },
]

export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export const ALL_CARDS: CardId[] = SUITS.flatMap(({ id }) => RANKS.map((rank) => `${rank}${id}` as CardId))

export function blankCardEntries(): Record<CardId, CardEntry> {
  return Object.fromEntries(
    ALL_CARDS.map((card) => [card, { card, person: '', action: '', object: '' }]),
  ) as Record<CardId, CardEntry>
}

export function cardLabel(card: CardId): string {
  const suit = SUITS.find(({ id }) => id === card.slice(-1))
  return `${card.slice(0, -1)}${suit?.symbol ?? ''}`
}

export function shuffledDeck(random = Math.random): CardId[] {
  const deck = [...ALL_CARDS]
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[deck[index], deck[target]] = [deck[target], deck[index]]
  }
  return deck
}
