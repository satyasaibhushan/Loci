import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { PlayingCard } from '../components/PlayingCard'
import { ALL_CARDS, SUITS } from '../data/cards'
import { useProgress } from '../contexts/ProgressContext'
import type { CardEntry, CardId } from '../types'

export function DeckCodexPage() {
  const { progress, updateCardEntry, completeQuest } = useProgress()
  const [selected, setSelected] = useState<CardId>('AS')
  const [draft, setDraft] = useState<CardEntry>(progress.cardEntries.AS)
  const peopleCount = ALL_CARDS.filter((card) => progress.cardEntries[card].person.trim()).length
  const fullCount = ALL_CARDS.filter((card) => {
    const entry = progress.cardEntries[card]
    return entry.person.trim() && entry.action.trim() && entry.object.trim()
  }).length
  const duplicatePeople = useMemo(() => {
    const people = ALL_CARDS.map((card) => progress.cardEntries[card].person.trim().toLowerCase()).filter(Boolean)
    return new Set(people.filter((person, index) => people.indexOf(person) !== index))
  }, [progress.cardEntries])

  useEffect(() => setDraft(progress.cardEntries[selected]), [selected, progress.cardEntries])
  useEffect(() => { if (peopleCount === 52) completeQuest('deck-codex') }, [peopleCount, completeQuest])

  const save = () => updateCardEntry({ ...draft, person: draft.person.trim(), action: draft.action.trim(), object: draft.object.trim() })

  return (
    <div className="codex-page wide-page page-enter">
      <PageHeader eyebrow="Deck expedition · Trial 1" title="The Card Cast" description="Begin with one unmistakable character per card. Add signature actions and objects now or when you upgrade to PAO." meta={`${peopleCount} / 52 characters`} />
      <div className="deck-codex-layout">
        <section className="card-codex-board">
          {SUITS.map((suit) => <div className="suit-row" key={suit.id}><header className={suit.color}><span>{suit.symbol}</span><small>{suit.name}</small></header><div>{ALL_CARDS.filter((card) => card.endsWith(suit.id)).map((card) => {
            const entry = progress.cardEntries[card]
            return <button className={`${selected === card ? 'selected' : ''} ${entry.person ? 'complete' : ''}`} type="button" key={card} onClick={() => setSelected(card)}><PlayingCard card={card} compact /><span>{entry.person || 'Uncast'}</span></button>
          })}</div></div>)}
        </section>
        <aside className="codex-editor card-editor">
          <div className="card-editor-heading"><PlayingCard card={selected} /><div><span>Permanent identity</span><h2>{selected}</h2></div></div>
          <p className="editor-intro">The person is enough for the first deck method. A natural action and object prepare the same cast for three-card PAO.</p>
          <label><span>Character <i>P</i></span><input value={draft.person} onChange={(event) => setDraft({ ...draft, person: event.target.value })} placeholder="A person you see instantly" autoFocus /></label>
          <label><span>Signature action <i>A</i></span><input value={draft.action} onChange={(event) => setDraft({ ...draft, action: event.target.value })} placeholder="What are they always doing?" /></label>
          <label><span>Signature object <i>O</i></span><input value={draft.object} onChange={(event) => setDraft({ ...draft, object: event.target.value })} placeholder="What object belongs to them?" /></label>
          {duplicatePeople.has(draft.person.trim().toLowerCase()) && draft.person && <div className="collision-note">Another card uses this character. Every card needs a unique face.</div>}
          <button className="primary-button full-button" type="button" onClick={save}>Save card identity</button>
          <div className="editor-foot"><span>{fullCount}/52 PAO-ready</span><small>{draft.person ? 'Character ready' : 'Character required'}</small></div>
        </aside>
      </div>
    </div>
  )
}
