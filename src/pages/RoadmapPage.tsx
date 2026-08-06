import { QUESTS } from '../data/quests'
import { QuestNode } from '../components/QuestNode'
import { useAuth } from '../contexts/AuthContext'
import { useProgress } from '../contexts/ProgressContext'
import { bestResult } from '../lib/progress'
import { Link } from '../lib/router'

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

  const currentQuest = QUESTS.find(({ id }) => statusFor(id) === 'current') ?? QUESTS[0]
  const completed = progress.completedQuests.length
  const rank = xp < 500 ? 'Wayfinder' : xp < 1500 ? 'Cartographer' : 'Mnemonist'

  return (
    <div className="map-page page-enter">
      <header className="campaign-hud">
        <div className="campaign-intro">
          <div className="eyebrow">Campaign 01 · The world within</div>
          <h1>Your memory realm</h1>
          <p>{user?.displayName.split(' ')[0]}, follow the trail. Master the cipher, forge your cast, then choose your legend.</p>
        </div>
        <div className="campaign-stats" aria-label="Campaign progress">
          <div><small>Rank</small><strong>{rank}</strong></div>
          <div><small>Realm cleared</small><strong>{completed}<i>/10</i></strong></div>
          <div><small>Experience</small><strong>{xp}<i> XP</i></strong></div>
          <span className="campaign-progress"><i style={{ width: `${completed * 10}%` }} /></span>
        </div>
      </header>

      <aside className="next-quest-card">
        <span className="next-quest-rune" aria-hidden="true">{currentQuest.icon}</span>
        <div><small>Next quest</small><b>{currentQuest.title}</b><span>{currentQuest.description}</span></div>
        <Link to={currentQuest.path}>Enter quest <span aria-hidden="true">→</span></Link>
      </aside>

      <section className="world-map" aria-label="Memory campaign map">
        <div className="map-atmosphere" aria-hidden="true">
          <i className="moon" />
          <i className="mountains mountain-one" />
          <i className="mountains mountain-two" />
          <i className="ruins">Ⅱ</i>
          <i className="card-tower">♠</i>
          <i className="pi-observatory">π</i>
        </div>

        <svg className="world-routes" viewBox="0 0 1000 1420" preserveAspectRatio="none" aria-hidden="true">
          <path className="route-shadow" d="M510 105 C340 190 700 270 445 370 S660 540 505 650" />
          <path className="route shared-route" d="M510 105 C340 190 700 270 445 370 S660 540 505 650" />
          <path className="route-shadow" d="M505 650 C380 740 270 755 225 870 S345 1060 250 1240" />
          <path className="route pi-route" d="M505 650 C380 740 270 755 225 870 S345 1060 250 1240" />
          <path className="route-shadow" d="M505 650 C640 735 775 735 765 860 S650 960 785 1055 S680 1185 785 1320" />
          <path className="route deck-route" d="M505 650 C640 735 775 735 765 860 S650 960 785 1055 S680 1185 785 1320" />
        </svg>

        <div className="region-title shared-region"><span>Ⅰ</span><div><small>Chapter one</small><strong>The Cipher Wilds</strong><i>Build the language</i></div></div>
        <div className="map-quest-layer shared-quests">
          {shared.map((quest) => <div className={`quest-position quest-${quest.id}`} key={quest.id}><QuestNode quest={quest} status={statusFor(quest.id)} /></div>)}
        </div>

        <div className="crossroads"><span>✦</span><small>The crossroads</small><strong>Choose your legend</strong></div>

        <section className="realm-label pi-realm">
          <span>π</span><div><small>Permanent memory</small><h2>The Infinite Isles</h2><p>Best: {piBest ? `${piBest.accuracy}% · ${piBest.length} digits` : 'Uncharted'}</p></div>
        </section>
        <div className="map-quest-layer pi-quests">
          {pi.map((quest) => <div className={`quest-position quest-${quest.id}`} key={quest.id}><QuestNode quest={quest} status={statusFor(quest.id)} /></div>)}
        </div>

        <section className="realm-label deck-realm">
          <span>♠</span><div><small>Rapid memory</small><h2>The House of Cards</h2><p>Best: {deckBest ? `${deckBest.accuracy}% · ${deckBest.length} cards` : 'Uncharted'}</p></div>
        </section>
        <div className="map-quest-layer deck-quests">
          {deck.map((quest) => <div className={`quest-position quest-${quest.id}`} key={quest.id}><QuestNode quest={quest} status={statusFor(quest.id)} /></div>)}
        </div>

        <div className="map-compass" aria-hidden="true"><span>N</span><i /><b>✦</b></div>
        <div className="map-key"><span><i className="key-current" />Current</span><span><i className="key-complete" />Cleared</span><span><i className="key-locked" />Locked</span></div>
      </section>
    </div>
  )
}
