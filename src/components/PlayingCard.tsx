import { SUITS, cardLabel } from '../data/cards'
import type { CardId } from '../types'

export function PlayingCard({ card, compact = false }: { card: CardId; compact?: boolean }) {
  const suit = SUITS.find(({ id }) => id === card.slice(-1))!
  return <span className={`playing-card ${suit.color} ${compact ? 'compact' : ''}`}><b>{card.slice(0, -1)}</b><i>{suit.symbol}</i><span className="sr-only">{cardLabel(card)}</span></span>
}
