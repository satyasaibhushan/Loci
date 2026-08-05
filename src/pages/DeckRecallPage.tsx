import { useMemo, useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { PlayingCard } from '../components/PlayingCard'
import { ALL_CARDS, shuffledDeck } from '../data/cards'
import { useProgress } from '../contexts/ProgressContext'
import type { CardId } from '../types'

type Phase = 'setup' | 'encode' | 'recall' | 'result'

export function DeckRecallPage() {
  const { progress, recordResult, completeQuest } = useProgress()
  const [phase, setPhase] = useState<Phase>('setup')
  const [deck, setDeck] = useState<CardId[]>(shuffledDeck)
  const [answer, setAnswer] = useState<CardId[]>([])
  const [elapsed, setElapsed] = useState(0)
  const startedAt = useRef(0)
  const fullPao = ALL_CARDS.every((card) => { const entry = progress.cardEntries[card]; return entry.person && entry.action && entry.object })
  const marks = useMemo(() => deck.map((card, index) => answer[index] === card), [deck, answer])
  const correct = marks.filter(Boolean).length

  const begin = () => { setDeck(shuffledDeck()); setAnswer([]); setPhase('encode') }
  const beginRecall = () => { startedAt.current = Date.now(); setPhase('recall') }
  const choose = (card: CardId) => { if (!answer.includes(card)) setAnswer((current) => [...current, card]) }
  const submit = () => {
    const seconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000))
    const accuracy = Math.round((correct / 52) * 100)
    setElapsed(seconds); setPhase('result')
    recordResult('deck', { accuracy, elapsedSeconds: seconds, length: 52, completedAt: new Date().toISOString() })
    if (correct === 52) completeQuest('deck-recall')
  }

  return <div className="challenge-page wide-page page-enter"><PageHeader eyebrow="Deck expedition · Final trial" title="The Full Deck" description="A new shuffle every time. Build eighteen scenes, hide the deck, walk your route and reconstruct it." meta="Fast temporary memory" />
    {phase === 'setup' && <section className="challenge-setup deck-setup"><div><div className="eyebrow">Speed cards</div><h2>One deck. Eighteen loci.</h2><p>The first seventeen loci hold three cards. The final locus holds one person as an end marker.</p></div><div className="deck-facts"><span><b>52</b> cards</span><span><b>18</b> loci</span><span><b>∞</b> shuffles</span></div>{!fullPao ? <p className="form-error">Complete all card actions and objects before this trial.</p> : <button className="primary-button" type="button" onClick={begin}>Deal a shuffled deck →</button>}</section>}
    {phase === 'encode' && <section className="deck-encoding"><div className="chamber-top"><div><div className="eyebrow">Encoding phase</div><h2>Turn each row into one moving scene.</h2></div><button className="primary-button" type="button" onClick={beginRecall}>Seal deck & recall →</button></div><div className="deck-scenes-list">{Array.from({ length: 18 }, (_, locus) => deck.slice(locus * 3, locus * 3 + 3)).map((cards, locus) => <article key={locus}><span className="locus-number">Locus {String(locus + 1).padStart(2, '0')}</span><div className="scene-cards">{cards.map((card, role) => <div key={card}><PlayingCard card={card} compact /><span><small>{['Person', 'Action', 'Object'][role]}</small><b>{role === 0 ? progress.cardEntries[card].person : role === 1 ? progress.cardEntries[card].action : progress.cardEntries[card].object}</b></span></div>)}</div></article>)}</div></section>}
    {phase === 'recall' && <section className="deck-reconstruction"><div className="reconstruction-head"><div><div className="eyebrow">Deck sealed</div><h2>Rebuild the order.</h2><p>Choose cards in sequence. Undo whenever a locus feels wrong.</p></div><div className="recall-actions"><button className="quiet-button" type="button" disabled={!answer.length} onClick={() => setAnswer((current) => current.slice(0, -1))}>Undo last</button><button className="primary-button" type="button" disabled={!answer.length} onClick={submit}>Verify {answer.length}/52</button></div></div><div className="answer-rack">{Array.from({ length: 52 }, (_, index) => answer[index]).map((card, index) => <span key={index}>{card ? <PlayingCard card={card} compact /> : <i>{index + 1}</i>}</span>)}</div><div className="card-pool">{ALL_CARDS.map((card) => <button type="button" key={card} disabled={answer.includes(card)} onClick={() => choose(card)}><PlayingCard card={card} compact /></button>)}</div></section>}
    {phase === 'result' && <section className="deck-result"><div className="result-summary"><div className="result-seal">{Math.round(correct / 52 * 100)}</div><div><div className="eyebrow">Deck report</div><h2>{correct} of 52 positions</h2><p>{elapsed} seconds of recall · {correct === 52 ? 'perfect reconstruction' : 'review the red positions'}</p></div></div><div className="deck-comparison">{deck.map((card, index) => <span key={card} className={marks[index] ? 'correct' : 'wrong'}><small>{index + 1}</small><PlayingCard card={answer[index] ?? card} compact /><i>{marks[index] ? '' : `was ${card}`}</i></span>)}</div><button className="primary-button" type="button" onClick={() => setPhase('setup')}>Return to the table →</button></section>}
  </div>
}
