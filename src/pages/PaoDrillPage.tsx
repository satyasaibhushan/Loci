import { useMemo, useState } from 'react'
import { useNavigate } from '../lib/router'
import { PageHeader } from '../components/PageHeader'
import { useProgress } from '../contexts/ProgressContext'
import type { PaoEntry } from '../types'

type Direction = 'number' | 'person' | 'action' | 'object'
const normal = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')

function randomQuestion(entries: PaoEntry[]): { entry: PaoEntry; direction: Direction } {
  return { entry: entries[Math.floor(Math.random() * entries.length)], direction: (['number', 'person', 'action', 'object'] as Direction[])[Math.floor(Math.random() * 4)] }
}

export function PaoDrillPage() {
  const { progress, recordDrill, completeQuest } = useProgress()
  const navigate = useNavigate()
  const entries = useMemo(() => Object.values(progress.paoEntries).filter((entry) => entry.person && entry.action && entry.object), [progress.paoEntries])
  const [question, setQuestion] = useState(() => entries.length ? randomQuestion(entries) : undefined)
  const [answers, setAnswers] = useState({ person: '', action: '', object: '', number: '' })
  const [checked, setChecked] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)

  if (entries.length < 10 || !question) return (
    <div className="narrow-page page-enter"><PageHeader eyebrow="Shared path · Level 4" title="Codex Reflex" description="Bidirectional drills begin once enough of your own cast exists." meta={`${entries.length} usable entries`} />
      <section className="empty-state"><span>Ⅳ</span><h2>Build at least ten complete trios.</h2><p>Your drill uses only your definitions—never generated substitutes.</p><button className="primary-button" type="button" onClick={() => navigate('/quest/pao-codex')}>Return to the codex →</button></section>
    </div>
  )

  const expected = question.entry
  const fields: ('person' | 'action' | 'object')[] = question.direction === 'number' ? ['person', 'action', 'object'] : []
  const isRight = question.direction === 'number'
    ? fields.every((field) => normal(answers[field]) === normal(expected[field]))
    : answers.number.padStart(2, '0') === expected.code

  const check = () => {
    const nextStreak = isRight ? streak + 1 : 0
    setChecked(true); setAttempts((value) => value + 1); setCorrect((value) => value + (isRight ? 1 : 0)); setStreak(nextStreak)
    recordDrill('pao-reflex', isRight, nextStreak)
  }
  const next = () => {
    if (attempts >= 19) { if ((correct + (isRight ? 1 : 0)) >= 18) completeQuest('pao-reflex'); return }
    setQuestion(randomQuestion(entries)); setAnswers({ person: '', action: '', object: '', number: '' }); setChecked(false)
  }
  const done = attempts >= 20

  return (
    <div className="drill-page narrow-page page-enter">
      <PageHeader eyebrow="Shared path · Level 4" title="Codex Reflex" description="Twenty prompts in both directions. Reach 90% to open the expedition fork." meta={`${attempts} / 20`} />
      {!done ? <section className="recall-card">
        <div className="drill-meta"><span>{question.direction === 'number' ? 'Number → PAO' : `${question.direction} → number`}</span><b>Streak {streak}</b></div>
        {question.direction === 'number' ? <div className="giant-code">{expected.code}</div> : <div className="giant-word"><small>{question.direction}</small>{expected[question.direction]}</div>}
        <div className={question.direction === 'number' ? 'pao-answer-grid' : 'single-answer'}>
          {question.direction === 'number' ? fields.map((field) => <label key={field}><span>{field}</span><input value={answers[field]} disabled={checked} onChange={(event) => setAnswers({ ...answers, [field]: event.target.value })} /></label>) : <label><span>Two-digit number</span><input inputMode="numeric" maxLength={2} value={answers.number} disabled={checked} onChange={(event) => setAnswers({ ...answers, number: event.target.value.replace(/\D/g, '') })} autoFocus /></label>}
        </div>
        {!checked ? <button className="primary-button full-button" type="button" onClick={check}>Verify association</button> : <div className={`answer-ribbon ${isRight ? 'success' : 'error'}`}><span>{isRight ? 'Exact recall' : `Correct: ${expected.code} · ${expected.person} / ${expected.action} / ${expected.object}`}</span><button type="button" onClick={next}>Next →</button></div>}
      </section> : <section className="result-card"><div className="result-seal">{correct >= 18 ? '✓' : '↻'}</div><div className="eyebrow">Reflex trial complete</div><h2>{correct} / 20</h2><p>{correct >= 18 ? 'The fork is open. Choose π or the deck.' : 'Review collisions and repeat until 18 associations land correctly.'}</p><div className="button-row"><button className="primary-button" type="button" onClick={() => { if (correct >= 18) completeQuest('pao-reflex'); navigate(correct >= 18 ? '/map' : '/quest/pao-drill') }}>{correct >= 18 ? 'Choose an expedition' : 'Repeat trial'} →</button></div></section>}
    </div>
  )
}
