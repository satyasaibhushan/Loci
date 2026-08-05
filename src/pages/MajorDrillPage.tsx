import { useMemo, useState } from 'react'
import { useNavigate } from '../lib/router'
import { PageHeader } from '../components/PageHeader'
import { MAJOR_SOUNDS, PRIMARY_SOUND } from '../data/majorSystem'
import { useProgress } from '../contexts/ProgressContext'

type DrillKind = 'digit' | 'sound' | 'pair'
interface Question { kind: DrillKind; prompt: string; answer: string; options: string[]; label: string }

function shuffled<T>(values: T[]): T[] { return [...values].sort(() => Math.random() - 0.5) }

function nextQuestion(): Question {
  const kind = shuffled<DrillKind>(['digit', 'sound', 'pair'])[0]
  const first = Math.floor(Math.random() * 10).toString()
  if (kind === 'digit') {
    const answer = MAJOR_SOUNDS[Number(first)].anchor
    return { kind, prompt: first, answer, label: 'Which sound family belongs to this digit?', options: shuffled([answer, ...shuffled(MAJOR_SOUNDS.filter(({ anchor }) => anchor !== answer).map(({ anchor }) => anchor)).slice(0, 3)]) }
  }
  if (kind === 'sound') {
    const sound = MAJOR_SOUNDS[Number(first)].sounds[0]
    return { kind, prompt: sound, answer: first, label: 'Which digit does this sound encode?', options: shuffled([first, ...shuffled(MAJOR_SOUNDS.filter(({ digit }) => digit !== first).map(({ digit }) => digit)).slice(0, 3)]) }
  }
  const second = Math.floor(Math.random() * 10).toString()
  const answer = `${first}${second}`
  const alternatives = new Set<string>()
  while (alternatives.size < 3) alternatives.add(Math.floor(Math.random() * 100).toString().padStart(2, '0'))
  alternatives.delete(answer)
  return { kind, prompt: `${PRIMARY_SOUND[first]} · ${PRIMARY_SOUND[second]}`, answer, label: 'Combine the two sounds. Which pair is encoded?', options: shuffled([answer, ...[...alternatives].slice(0, 3)]) }
}

export function MajorDrillPage() {
  const { recordDrill, completeQuest } = useProgress()
  const navigate = useNavigate()
  const [question, setQuestion] = useState(nextQuestion)
  const [selected, setSelected] = useState('')
  const [round, setRound] = useState(1)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const finished = round > 12
  const passed = correct >= 10
  const progressWidth = `${Math.min(round - 1, 12) / 12 * 100}%`
  const feedback = useMemo(() => selected ? selected === question.answer : undefined, [selected, question])

  const answer = (option: string) => {
    if (selected) return
    const right = option === question.answer
    const nextStreak = right ? streak + 1 : 0
    setSelected(option)
    setCorrect((value) => value + (right ? 1 : 0))
    setStreak(nextStreak)
    recordDrill('major-reflex', right, nextStreak)
  }

  const advance = () => {
    if (round === 12) {
      setRound(13)
      if (correct >= 10) completeQuest('major-reflex')
      return
    }
    setRound((value) => value + 1)
    setQuestion(nextQuestion())
    setSelected('')
  }

  const restart = () => { setRound(1); setCorrect(0); setStreak(0); setSelected(''); setQuestion(nextQuestion()) }

  return (
    <div className="drill-page narrow-page page-enter">
      <PageHeader eyebrow="Shared path · Level 2" title="Cipher Reflex" description="Twelve quick decisions. Score ten to unlock your personal PAO codex." meta={`${Math.min(round, 12)} / 12`} />
      <div className="drill-progress"><span style={{ width: progressWidth }} /></div>

      {!finished ? (
        <section className="drill-card">
          <div className="drill-meta"><span>{question.kind === 'pair' ? 'Pair decoding' : 'Sound mapping'}</span><b>Streak {streak}</b></div>
          <p>{question.label}</p>
          <div className="drill-prompt">{question.prompt}</div>
          <div className="option-grid">
            {question.options.map((option) => (
              <button type="button" key={option} className={selected ? option === question.answer ? 'correct' : option === selected ? 'wrong' : 'muted' : ''} onClick={() => answer(option)}>{option}</button>
            ))}
          </div>
          {selected && <div className={`answer-ribbon ${feedback ? 'success' : 'error'}`}><span>{feedback ? 'Correct' : `Answer: ${question.answer}`}</span><button type="button" onClick={advance}>{round === 12 ? 'See result' : 'Next'} →</button></div>}
        </section>
      ) : (
        <section className="result-card">
          <div className="result-seal">{passed ? '✓' : '↻'}</div>
          <div className="eyebrow">Trial complete</div>
          <h2>{correct} of 12</h2>
          <p>{passed ? 'The cipher is stable enough to begin building your codex.' : 'You are close. Another pass will turn recognition into reflex.'}</p>
          <div className="button-row">
            {!passed && <button className="secondary-button" type="button" onClick={restart}>Try again</button>}
            {passed && <button className="primary-button" type="button" onClick={() => navigate('/quest/pao-codex')}>Open the PAO codex →</button>}
          </div>
        </section>
      )}
    </div>
  )
}
