import { useMemo, useState } from 'react'
import { useNavigate } from '../lib/router'
import { PlayingCard } from '../components/PlayingCard'
import { PageHeader } from '../components/PageHeader'
import { ALL_CARDS } from '../data/cards'
import { useProgress } from '../contexts/ProgressContext'
import type { CardId } from '../types'

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')

export function DeckScenesPage() {
  const { progress, recordDrill, completeQuest } = useProgress()
  const navigate = useNavigate()
  const ready = useMemo(() => ALL_CARDS.filter((card) => { const entry = progress.cardEntries[card]; return entry.person && entry.action && entry.object }), [progress.cardEntries])
  const randomTriple = (): CardId[] => [...ready].sort(() => Math.random() - 0.5).slice(0, 3)
  const [cards, setCards] = useState<CardId[]>(() => ready.slice(0, 3))
  const [answers, setAnswers] = useState({ person: '', action: '', object: '' })
  const [checked, setChecked] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [correct, setCorrect] = useState(0)

  if (ready.length < 52) return <div className="narrow-page page-enter"><PageHeader eyebrow="Deck expedition · Trial 3" title="Triple-Card Scenes" description="Full PAO needs a person, action and object for every card." meta={`${ready.length} / 52 PAO-ready`} /><section className="empty-state"><span>♦</span><h2>Finish the signature actions and objects.</h2><p>Your original characters stay intact; this upgrade compresses three cards into one scene.</p><button className="primary-button" type="button" onClick={() => navigate('/quest/deck-codex')}>Complete the card cast →</button></section></div>

  const expected = { person: progress.cardEntries[cards[0]].person, action: progress.cardEntries[cards[1]].action, object: progress.cardEntries[cards[2]].object }
  const isRight = (Object.keys(expected) as (keyof typeof expected)[]).every((key) => normalize(answers[key]) === normalize(expected[key]))
  const done = attempts >= 10
  const check = () => { setChecked(true); setAttempts((value) => value + 1); setCorrect((value) => value + (isRight ? 1 : 0)); recordDrill('deck-scenes', isRight, isRight ? correct + 1 : 0) }
  const next = () => { setCards(randomTriple()); setAnswers({ person: '', action: '', object: '' }); setChecked(false) }

  return <div className="drill-page narrow-page page-enter"><PageHeader eyebrow="Deck expedition · Trial 3" title="Triple-Card Scenes" description="First card supplies the person, second the action, third the object. One scene now holds three cards." meta={`${attempts} / 10`} />
    {!done ? <section className="scene-card"><div className="card-triple">{cards.map((card, index) => <span key={card}><PlayingCard card={card} /><small>{['Person', 'Action', 'Object'][index]}</small></span>)}</div><div className="pao-answer-grid">{(Object.keys(answers) as (keyof typeof answers)[]).map((field) => <label key={field}><span>{field}</span><input value={answers[field]} disabled={checked} onChange={(event) => setAnswers({ ...answers, [field]: event.target.value })} /></label>)}</div>{!checked ? <button className="primary-button full-button" type="button" onClick={check}>Verify scene</button> : <div className={`answer-ribbon ${isRight ? 'success' : 'error'}`}><span>{isRight ? 'Scene ready for a locus' : `${expected.person} · ${expected.action} · ${expected.object}`}</span><button type="button" onClick={next}>Next →</button></div>}</section>
      : <section className="result-card"><div className="result-seal">{correct >= 8 ? '✓' : '↻'}</div><div className="eyebrow">Compression trial</div><h2>{correct} / 10</h2><p>{correct >= 8 ? 'You can now hold a deck in eighteen loci.' : 'The roles are still crossing. Repeat before attempting a full deck.'}</p><button className="primary-button" type="button" onClick={() => { if (correct >= 8) completeQuest('deck-scenes'); navigate(correct >= 8 ? '/quest/deck-recall' : '/quest/deck-scenes') }}>{correct >= 8 ? 'Attempt a full deck' : 'Repeat'} →</button></section>}
  </div>
}
