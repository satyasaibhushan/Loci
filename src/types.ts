export type QuestId =
  | 'major-foundations'
  | 'major-reflex'
  | 'pao-codex'
  | 'pao-reflex'
  | 'pi-scenes'
  | 'pi-recall'
  | 'deck-codex'
  | 'deck-reflex'
  | 'deck-scenes'
  | 'deck-recall'

export type Campaign = 'shared' | 'pi' | 'deck'

export interface PaoEntry {
  code: string
  person: string
  action: string
  object: string
  cue?: string
  imageUrl?: string
  imageProvider?: 'uploadthing' | 'external'
  /** Legacy Firebase Storage path, retained so older saved progress still hydrates safely. */
  imagePath?: string
}

export type Suit = 'S' | 'H' | 'D' | 'C'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
export type CardId = `${Rank}${Suit}`

export interface CardEntry {
  card: CardId
  person: string
  action: string
  object: string
}

export interface DrillStats {
  attempts: number
  correct: number
  bestStreak: number
}

export interface ChallengeResult {
  accuracy: number
  elapsedSeconds: number
  length: number
  completedAt: string
}

export interface ProgressState {
  version: 1
  completedQuests: QuestId[]
  paoEntries: Record<string, PaoEntry>
  cardEntries: Record<CardId, CardEntry>
  drillStats: Partial<Record<QuestId, DrillStats>>
  piResults: ChallengeResult[]
  deckResults: ChallengeResult[]
  lastVisited: string
}

export interface AppUser {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  isDemo: boolean
}

export interface QuestDefinition {
  id: QuestId
  title: string
  eyebrow: string
  description: string
  path: string
  campaign: Campaign
  icon: string
  xp: number
  prerequisites: QuestId[]
}
