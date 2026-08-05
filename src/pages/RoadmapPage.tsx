import { QUESTS } from '../data/quests'
import { QuestNode } from '../components/QuestNode'
import { useAuth } from '../contexts/AuthContext'
import { useProgress } from '../contexts/ProgressContext'
import { bestResult } from '../lib/progress'

export function RoadmapPage() {
  const { user } = useAuth()
  const { progress, isUnlocked, xp } = useProgress()
  const shared = QUESTS.filter(({ campaign }) => campaign === 'shared')
  const pi = QUESTS.filter(({ campaign }) => campaign === 'pi')
  const deck = QUESTS.filter(({ campaign }) => campaign === 'deck')
  const piBest = bestResult(progress.piResults)
  const deckBest = bestResult(progress.deckResults)

  const statusFor = (id: typeof QUESTS[number]['id']) => progress.completedQuests.includes(id)
    ? 'complete' as const
    : isUnlocked(id) ? 'current' as const : 'locked' as const

  return (
    <div className="map-page page-enter">
      <header className="map-hero">
        <div>
          <div className="eyebrow">Field map · Expedition one</div>
          <h1>Good morning, {user?.displayName.split(' ')[0]}.</h1>
          <p>Master the shared language. Then choose what should become impossible.</p>
        </div>
        <div className="rank-seal">
          <small>Current rank</small>
          <strong>{xp < 500 ? 'Wayfinder' : xp < 1500 ? 'Cartographer' : 'Mnemonist'}</strong>
          <span>{xp} accumulated XP</span>
        </div>
      </header>

      <section className="roadmap" aria-label="Learning roadmap">
        <div className="roadmap-label"><span>Common ground</span><i /></div>
        <div className="shared-road">
          {shared.map((quest) => <QuestNode key={quest.id} quest={quest} status={statusFor(quest.id)} />)}
        </div>

        <div className="fork-marker"><span>Choose an expedition</span></div>
        <div className="campaign-fork">
          <section className="campaign-column pi-campaign">
            <header><span>π</span><div><small>Permanent memory</small><h2>The π Expedition</h2></div></header>
            {pi.map((quest) => <QuestNode key={quest.id} quest={quest} status={statusFor(quest.id)} />)}
            <div className="campaign-best">Best recall <b>{piBest ? `${piBest.accuracy}% · ${piBest.length} digits` : 'Not attempted'}</b></div>
          </section>
          <section className="campaign-column deck-campaign">
            <header><span>♠</span><div><small>Fast temporary memory</small><h2>The Deck Expedition</h2></div></header>
            {deck.map((quest) => <QuestNode key={quest.id} quest={quest} status={statusFor(quest.id)} />)}
            <div className="campaign-best">Best recall <b>{deckBest ? `${deckBest.accuracy}% · ${deckBest.length} cards` : 'Not attempted'}</b></div>
          </section>
        </div>
      </section>
    </div>
  )
}
