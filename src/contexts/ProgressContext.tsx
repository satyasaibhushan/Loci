/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { QUEST_BY_ID } from '../data/quests'
import { createInitialProgress, isQuestUnlocked } from '../lib/progress'
import { loadProgress, saveProgress } from '../lib/storage'
import type { CardEntry, ChallengeResult, DrillStats, PaoEntry, ProgressState, QuestId } from '../types'
import { useAuth } from './AuthContext'

interface ProgressContextValue {
  progress: ProgressState
  loading: boolean
  saving: boolean
  xp: number
  completeQuest: (id: QuestId) => void
  isUnlocked: (id: QuestId) => boolean
  updatePaoEntry: (entry: PaoEntry) => void
  updateCardEntry: (entry: CardEntry) => void
  recordDrill: (id: QuestId, correct: boolean, streak: number) => void
  recordResult: (campaign: 'pi' | 'deck', result: ChallengeResult) => void
  replaceProgress: (progress: ProgressState) => void
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [progress, setProgress] = useState(createInitialProgress)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const hydrated = useRef(false)

  useEffect(() => {
    if (!user) return
    let active = true
    setLoading(true)
    void loadProgress(user.uid, user.isDemo).then((loaded) => {
      if (!active) return
      setProgress(loaded)
      hydrated.current = true
      setLoading(false)
    })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (!user || !hydrated.current) return
    setSaving(true)
    const timer = window.setTimeout(() => {
      void saveProgress(user.uid, user.isDemo, progress).finally(() => setSaving(false))
    }, 450)
    return () => window.clearTimeout(timer)
  }, [progress, user])

  const completeQuest = (id: QuestId) => {
    setProgress((current) => current.completedQuests.includes(id)
      ? current
      : { ...current, completedQuests: [...current.completedQuests, id] })
  }

  const isUnlocked = (id: QuestId) => {
    const quest = QUEST_BY_ID[id]
    return isQuestUnlocked(id, progress.completedQuests, quest.prerequisites)
  }

  const updatePaoEntry = (entry: PaoEntry) => {
    setProgress((current) => ({ ...current, paoEntries: { ...current.paoEntries, [entry.code]: entry } }))
  }

  const updateCardEntry = (entry: CardEntry) => {
    setProgress((current) => ({ ...current, cardEntries: { ...current.cardEntries, [entry.card]: entry } }))
  }

  const recordDrill = (id: QuestId, correct: boolean, streak: number) => {
    setProgress((current) => {
      const prior: DrillStats = current.drillStats[id] ?? { attempts: 0, correct: 0, bestStreak: 0 }
      return {
        ...current,
        drillStats: {
          ...current.drillStats,
          [id]: {
            attempts: prior.attempts + 1,
            correct: prior.correct + (correct ? 1 : 0),
            bestStreak: Math.max(prior.bestStreak, streak),
          },
        },
      }
    })
  }

  const recordResult = (campaign: 'pi' | 'deck', result: ChallengeResult) => {
    setProgress((current) => campaign === 'pi'
      ? { ...current, piResults: [...current.piResults, result].slice(-30) }
      : { ...current, deckResults: [...current.deckResults, result].slice(-30) })
  }

  const xp = progress.completedQuests.reduce((sum, id) => sum + QUEST_BY_ID[id].xp, 0)

  const value = {
    progress, loading, saving, xp, completeQuest, isUnlocked, updatePaoEntry, updateCardEntry,
    recordDrill, recordResult, replaceProgress: setProgress,
  }

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext)
  if (!context) throw new Error('useProgress must be used inside ProgressProvider')
  return context
}
