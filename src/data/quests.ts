import type { QuestDefinition, QuestId } from '../types'

export const QUESTS: QuestDefinition[] = [
  {
    id: 'major-foundations', title: 'The Major Cipher', eyebrow: 'Shared · Level 1',
    description: 'Learn the ten sound families that turn digits into images.', path: '/quest/major',
    campaign: 'shared', icon: 'Ⅰ', xp: 100, prerequisites: [],
  },
  {
    id: 'major-reflex', title: 'Cipher Reflex', eyebrow: 'Shared · Level 2',
    description: 'Decode digits, sounds and two-digit pairs without hesitation.', path: '/quest/major-drill',
    campaign: 'shared', icon: 'Ⅱ', xp: 150, prerequisites: ['major-foundations'],
  },
  {
    id: 'pao-codex', title: 'The PAO Codex', eyebrow: 'Shared · Level 3',
    description: 'Author your permanent cast of 100 people, actions and objects.', path: '/quest/pao-codex',
    campaign: 'shared', icon: 'Ⅲ', xp: 500, prerequisites: ['major-reflex'],
  },
  {
    id: 'pao-reflex', title: 'Codex Reflex', eyebrow: 'Shared · Level 4',
    description: 'Make every number and image association travel both ways.', path: '/quest/pao-drill',
    campaign: 'shared', icon: 'Ⅳ', xp: 250, prerequisites: ['pao-codex'],
  },
  {
    id: 'pi-scenes', title: 'Six-Digit Alchemy', eyebrow: 'π Expedition · Trial 1',
    description: 'Compose person, action and object into one verified scene.', path: '/quest/pi-scenes',
    campaign: 'pi', icon: 'π', xp: 300, prerequisites: ['pao-reflex'],
  },
  {
    id: 'pi-recall', title: 'The Hundred', eyebrow: 'π Expedition · Final trial',
    description: 'Walk your private palace and return with 100 digits intact.', path: '/quest/pi-recall',
    campaign: 'pi', icon: '100', xp: 1000, prerequisites: ['pi-scenes'],
  },
  {
    id: 'deck-codex', title: 'The Card Cast', eyebrow: 'Deck Expedition · Trial 1',
    description: 'Give every card a permanent, unmistakable character.', path: '/quest/deck-codex',
    campaign: 'deck', icon: '♠', xp: 350, prerequisites: ['pao-reflex'],
  },
  {
    id: 'deck-reflex', title: 'Card Reflex', eyebrow: 'Deck Expedition · Trial 2',
    description: 'See the character instantly—and recover the card from them.', path: '/quest/deck-drill',
    campaign: 'deck', icon: '♥', xp: 250, prerequisites: ['deck-codex'],
  },
  {
    id: 'deck-scenes', title: 'Triple-Card Scenes', eyebrow: 'Deck Expedition · Trial 3',
    description: 'Upgrade your cast into PAO scenes that hold three cards each.', path: '/quest/deck-scenes',
    campaign: 'deck', icon: '♦', xp: 400, prerequisites: ['deck-reflex'],
  },
  {
    id: 'deck-recall', title: 'The Full Deck', eyebrow: 'Deck Expedition · Final trial',
    description: 'Encode a fresh shuffle, walk the route and rebuild all 52 cards.', path: '/quest/deck-recall',
    campaign: 'deck', icon: '52', xp: 1000, prerequisites: ['deck-scenes'],
  },
]

export const QUEST_BY_ID = Object.fromEntries(QUESTS.map((quest) => [quest.id, quest])) as Record<QuestId, QuestDefinition>
