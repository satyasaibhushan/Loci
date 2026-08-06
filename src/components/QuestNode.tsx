import { Link } from '../lib/router'
import type { QuestDefinition } from '../types'

export function QuestNode({ quest, status }: { quest: QuestDefinition; status: 'complete' | 'current' | 'locked' }) {
  const statusLabel = status === 'complete' ? 'completed' : status === 'current' ? 'current quest' : 'future quest'
  const content = (
    <>
      <span className="quest-orb" aria-hidden="true">
        <span>{status === 'complete' ? '✓' : status === 'locked' ? '◆' : quest.icon}</span>
      </span>
      <span className="quest-plaque">
        <small>{quest.eyebrow}</small>
        <b>{quest.title}</b>
        <span className="quest-detail">{quest.description}</span>
        <span className="quest-reward">{status === 'complete' ? 'Mastered' : status === 'locked' ? 'Locked' : `Play · +${quest.xp} XP`}</span>
      </span>
    </>
  )
  return <Link className={`world-quest ${quest.campaign} ${status}`} to={quest.path} aria-label={`${quest.title}, ${statusLabel}`}>{content}</Link>
}
