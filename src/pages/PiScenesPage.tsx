import { useMemo, useState } from 'react'
import { useNavigate } from '../lib/router'
import { PageHeader } from '../components/PageHeader'
import { PI_DIGITS, chunkDigits } from '../data/pi'
import { useProgress } from '../contexts/ProgressContext'

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')

export function PiScenesPage() {
  const { progress, recordDrill, completeQuest } = useProgress()
  const navigate = useNavigate()
  const chunks = useMemo(() => chunkDigits(PI_DIGITS.slice(0, 96)).filter((chunk) => [0, 2, 4].every((index) => progress.paoEntries[chunk.slice(index, index + 2)])), [progress.paoEntries])
  const [chunk, setChunk] = useState(() => chunks[0] ?? '')
  const [answers, setAnswers] = useState({ person: '', action: '', object: '' })
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [streak, setStreak] = useState(0)

  if (!chunk) return <div className="narrow-page page-enter"><PageHeader eyebrow="π expedition · Trial 1" title="Six-Digit Alchemy" description="This trial uses complete entries from your codex." meta="Blocked" /><section className="empty-state"><span>π</span><h2>The required entries are incomplete.</h2><p>Complete the shared PAO codex before composing π.</p><button className="primary-button" type="button" onClick={() => navigate('/quest/pao-codex')}>Open codex →</button></section></div>

  const codes = [chunk.slice(0, 2), chunk.slice(2, 4), chunk.slice(4, 6)]
  const expected = {
    person: progress.paoEntries[codes[0]].person,
    action: progress.paoEntries[codes[1]].action,
    object: progress.paoEntries[codes[2]].object,
  }
  const isRight = (Object.keys(expected) as (keyof typeof expected)[]).every((key) => normalize(answers[key]) === normalize(expected[key]))
  const done = attempts >= 10

  const check = () => {
    const nextStreak = isRight ? streak + 1 : 0
    setChecked(true); setCorrect((value) => value + (isRight ? 1 : 0)); setAttempts((value) => value + 1); setStreak(nextStreak)
    recordDrill('pi-scenes', isRight, nextStreak)
  }
  const next = () => {
    if (attempts >= 10) { if (correct >= 8) completeQuest('pi-scenes'); return }
    setChunk(chunks[Math.floor(Math.random() * chunks.length)]); setAnswers({ person: '', action: '', object: '' }); setChecked(false)
  }

  return (
    <div className="drill-page narrow-page page-enter">
      <PageHeader eyebrow="π expedition · Trial 1" title="Six-Digit Alchemy" description="Read three pairs by role. You create the impossible scene; Loci verifies its ingredients." meta={`${attempts} / 10`} />
      {!done ? <section className="scene-card">
        <div className="chunk-display">{codes.map((code, index) => <span key={`${code}-${index}`}><b>{code}</b><small>{['Person', 'Action', 'Object'][index]}</small></span>)}</div>
        <div className="scene-equation"><i>P</i><span>does</span><i>A</i><span>with</span><i>O</i></div>
        <div className="pao-answer-grid">
          {(Object.keys(answers) as (keyof typeof answers)[]).map((field) => <label key={field}><span>{field}</span><input value={answers[field]} disabled={checked} onChange={(event) => setAnswers({ ...answers, [field]: event.target.value })} /></label>)}
        </div>
        {!checked ? <button className="primary-button full-button" type="button" onClick={check}>Verify ingredients</button> : <div className={`answer-ribbon ${isRight ? 'success' : 'error'}`}><span>{isRight ? 'Correct. Now make it move in your mind.' : `${expected.person} · ${expected.action} · ${expected.object}`}</span><button type="button" onClick={next}>Scene placed →</button></div>}
      </section> : <section className="result-card"><div className="result-seal">{correct >= 8 ? '✓' : '↻'}</div><div className="eyebrow">Composition trial</div><h2>{correct} / 10</h2><p>{correct >= 8 ? 'Your ingredients are stable. The palace trial is ready.' : 'Repeat until the roles stop competing for attention.'}</p><button className="primary-button" type="button" onClick={() => correct >= 8 ? (completeQuest('pi-scenes'), navigate('/quest/pi-recall')) : window.location.reload()}>{correct >= 8 ? 'Begin the π trial' : 'Repeat'} →</button></section>}
    </div>
  )
}
