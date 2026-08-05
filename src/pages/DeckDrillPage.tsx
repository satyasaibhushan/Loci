import { useMemo, useState } from 'react'
import { useNavigate } from '../lib/router'
import { PageHeader } from '../components/PageHeader'
import { PlayingCard } from '../components/PlayingCard'
import { ALL_CARDS } from '../data/cards'
import { useProgress } from '../contexts/ProgressContext'
import type { CardId } from '../types'

type Direction = 'card' | 'person'
const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')

export function DeckDrillPage() {
  const { progress, recordDrill, completeQuest } = useProgress()
  const navigate = useNavigate()
  const ready = useMemo(() => ALL_CARDS.filter((card) => progress.cardEntries[card].person), [progress.cardEntries])
  const choose = () => ready[Math.floor(Math.random() * ready.length)]
  const [card, setCard] = useState<CardId>(() => ready[0] ?? 'AS')
  const [direction, setDirection] = useState<Direction>('card')
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)

  if (ready.length < 10) return <div className="narrow-page page-enter"><PageHeader eyebrow="Deck expedition · Trial 2" title="Card Reflex" description="The drill uses only characters you chose." meta={`${ready.length} cards ready`} /><section className="empty-state"><span>♠</span><h2>Cast at least ten cards.</h2><p>Eventually all 52 must produce a character without translation.</p><button className="primary-button" type="button" onClick={() => navigate('/quest/deck-codex')}>Open the card cast →</button></section></div>

  const expected = direction === 'card' ? progress.cardEntries[card].person : card
  const isRight = normalize(answer) === normalize(expected)
  const done = attempts >= 20
  const check = () => {
    const nextStreak = isRight ? streak + 1 : 0
    setChecked(true); setAttempts((value) => value + 1); setCorrect((value) => value + (isRight ? 1 : 0)); setStreak(nextStreak)
    recordDrill('deck-reflex', isRight, nextStreak)
  }
  const next = () => {
    setCard(choose()); setDirection(Math.random() > 0.5 ? 'card' : 'person'); setAnswer(''); setChecked(false)
  }

  return (
    <div className="drill-page narrow-page page-enter">
      <PageHeader eyebrow="Deck expedition · Trial 2" title="Card Reflex" description="Twenty associations in both directions. Aim for instant recognition—not clever decoding." meta={`${attempts} / 20`} />
      {!done ? <section className="recall-card card-recall-card">
        <div className="drill-meta"><span>{direction === 'card' ? 'Card → character' : 'Character → card'}</span><b>Streak {streak}</b></div>
        {direction === 'card' ? <div className="hero-card"><PlayingCard card={card} /></div> : <div className="giant-word"><small>Who belongs to which card?</small>{progress.cardEntries[card].person}</div>}
        <label className="single-answer"><span>{direction === 'card' ? 'Character' : 'Card code, e.g. AS or 10H'}</span><input autoFocus value={answer} disabled={checked} onChange={(event) => setAnswer(event.target.value.toUpperCase())} /></label>
        {!checked ? <button className="primary-button full-button" type="button" onClick={check}>Verify</button> : <div className={`answer-ribbon ${isRight ? 'success' : 'error'}`}><span>{isRight ? 'Immediate hit' : `Correct: ${expected}`}</span><button type="button" onClick={next}>Next →</button></div>}
      </section> : <section className="result-card"><div className="result-seal">{correct >= 18 ? '✓' : '↻'}</div><div className="eyebrow">Card reflex report</div><h2>{correct} / 20</h2><p>{correct >= 18 ? 'Your cast is ready for movement and interaction.' : 'Return to the weak cards and make their characters more distinctive.'}</p><button className="primary-button" type="button" onClick={() => { if (correct >= 18) completeQuest('deck-reflex'); navigate(correct >= 18 ? '/quest/deck-scenes' : '/quest/deck-drill') }}>{correct >= 18 ? 'Train triple scenes' : 'Repeat'} →</button></section>}
    </div>
  )
}
