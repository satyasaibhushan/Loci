// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuestNode } from '../components/QuestNode'
import { QUESTS } from '../data/quests'
import { RouterProvider } from '../lib/router'

describe('QuestNode', () => {
  it('opens its level even when progression marks it as locked', () => {
    const quest = QUESTS.find(({ id }) => id === 'pao-codex')
    if (!quest) throw new Error('PAO codex quest is missing')

    render(
      <RouterProvider>
        <QuestNode quest={quest} status="locked" />
      </RouterProvider>,
    )

    expect(screen.getByRole('link', { name: /The PAO Codex/i }).getAttribute('href')).toBe(quest.path)
  })
})
