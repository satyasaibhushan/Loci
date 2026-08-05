import { Link } from '../lib/router'
import type { QuestDefinition } from '../types'

export function QuestNode({ quest, status }: { quest: QuestDefinition; status: 'complete' | 'current' | 'locked' }) {
  const content = (
    <>
      <span className="node-icon" aria-hidden="true">{status === 'complete' ? '✓' : status === 'locked' ? '·' : quest.icon}</span>
      <span className="node-copy">
        <small>{quest.eyebrow}</small>
        <b>{quest.title}</b>
        <span>{quest.description}</span>
      </span>
      <span className="node-xp">+{quest.xp} XP</span>
    </>
  )
  return status === 'locked' ? (
    <div className={`quest-node ${status}`} aria-disabled="true">{content}</div>
  ) : (
    <Link className={`quest-node ${status}`} to={quest.path}>{content}</Link>
  )
}
