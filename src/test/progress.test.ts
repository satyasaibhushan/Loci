import { describe, expect, it } from 'vitest'
import { createInitialProgress, hydrateProgress, isQuestUnlocked, scoreSequence } from '../lib/progress'

describe('progress state', () => {
  it('starts with a complete blank card dictionary', () => {
    const progress = createInitialProgress()
    expect(Object.keys(progress.cardEntries)).toHaveLength(52)
    expect(progress.completedQuests).toEqual([])
  })

  it('hydrates partial older data with current defaults', () => {
    const progress = hydrateProgress({ completedQuests: ['major-foundations'] })
    expect(progress.completedQuests).toEqual(['major-foundations'])
    expect(Object.keys(progress.cardEntries)).toHaveLength(52)
  })

  it('requires every prerequisite unless already completed', () => {
    expect(isQuestUnlocked('pao-codex', ['major-foundations'], ['major-foundations', 'major-reflex'])).toBe(false)
    expect(isQuestUnlocked('pao-codex', ['major-foundations', 'major-reflex'], ['major-foundations', 'major-reflex'])).toBe(true)
  })

  it('scores positional digit recall and ignores punctuation', () => {
    expect(scoreSequence('141592', '14 1593')).toEqual({
      correct: 5,
      accuracy: 83,
      marks: [true, true, true, true, true, false],
    })
  })
})
