import { blankCardEntries } from '../data/cards'
import type { ChallengeResult, ProgressState, QuestId } from '../types'

export function createInitialProgress(): ProgressState {
  return {
    version: 1,
    completedQuests: [],
    paoEntries: {},
    cardEntries: blankCardEntries(),
    drillStats: {},
    piResults: [],
    deckResults: [],
    lastVisited: '/',
  }
}

export function hydrateProgress(value: unknown): ProgressState {
  const initial = createInitialProgress()
  if (!value || typeof value !== 'object') return initial
  const partial = value as Partial<ProgressState>
  return {
    ...initial,
    ...partial,
    completedQuests: Array.isArray(partial.completedQuests) ? partial.completedQuests : [],
    paoEntries: partial.paoEntries ?? {},
    cardEntries: { ...initial.cardEntries, ...(partial.cardEntries ?? {}) },
    drillStats: partial.drillStats ?? {},
    piResults: Array.isArray(partial.piResults) ? partial.piResults : [],
    deckResults: Array.isArray(partial.deckResults) ? partial.deckResults : [],
  }
}

export function isQuestUnlocked(questId: QuestId, completed: QuestId[], prerequisites: QuestId[]): boolean {
  if (completed.includes(questId)) return true
  return prerequisites.every((id) => completed.includes(id))
}

export function scoreSequence(expected: string, answer: string): { correct: number; accuracy: number; marks: boolean[] } {
  const cleanAnswer = answer.replace(/\D/g, '')
  const marks = expected.split('').map((digit, index) => digit === cleanAnswer[index])
  const correct = marks.filter(Boolean).length
  return { correct, accuracy: expected.length ? Math.round((correct / expected.length) * 100) : 0, marks }
}

export function bestResult(results: ChallengeResult[]): ChallengeResult | undefined {
  return [...results].sort((a, b) => b.accuracy - a.accuracy || a.elapsedSeconds - b.elapsedSeconds)[0]
}
