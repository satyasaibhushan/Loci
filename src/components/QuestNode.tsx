import { Link } from '../lib/router'
import type { QuestDefinition } from '../types'

export function QuestNode({ quest, status }: { quest: QuestDefinition; status: 'complete' | 'current' | 'locked' }) {
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
  return status === 'locked' ? (
    <div className={`world-quest ${quest.campaign} ${status}`} aria-disabled="true">{content}</div>
  ) : (
    <Link className={`world-quest ${quest.campaign} ${status}`} to={quest.path} aria-label={`${quest.title}, ${status === 'complete' ? 'completed' : 'current quest'}`}>{content}</Link>
  )
}
