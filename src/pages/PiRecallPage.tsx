import { useMemo, useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { PI_DIGITS, chunkDigits } from '../data/pi'
import { scoreSequence } from '../lib/progress'
import { useProgress } from '../contexts/ProgressContext'

type Phase = 'setup' | 'encode' | 'recall' | 'result'
const LENGTHS = [18, 30, 60, 100]

export function PiRecallPage() {
  const { progress, recordResult, completeQuest } = useProgress()
  const [length, setLength] = useState(18)
  const [phase, setPhase] = useState<Phase>('setup')
  const [answer, setAnswer] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const startedAt = useRef(0)
  const expected = PI_DIGITS.slice(0, length)
  const score = useMemo(() => scoreSequence(expected, answer), [expected, answer])
  const missingCodes = useMemo(() => [...new Set(chunkDigits(expected, 2).filter((code) => !progress.paoEntries[code]))], [expected, progress.paoEntries])

  const startRecall = () => { startedAt.current = Date.now(); setPhase('recall'); setAnswer('') }
  const submit = () => {
    const seconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000))
    setElapsed(seconds); setPhase('result')
    recordResult('pi', { accuracy: score.accuracy, elapsedSeconds: seconds, length, completedAt: new Date().toISOString() })
    if (length === 100 && score.accuracy === 100) completeQuest('pi-recall')
  }
  const reset = () => { setPhase('setup'); setAnswer(''); setElapsed(0) }

  return (
    <div className="challenge-page wide-page page-enter">
      <PageHeader eyebrow="π expedition · Final trial" title="The Hundred" description="The palace never enters this app. Encode here, walk it privately, then return with the digits." meta="Permanent memory" />
      {phase === 'setup' && <section className="challenge-setup">
        <div><div className="eyebrow">Choose today’s distance</div><h2>How far will you walk?</h2><p>Start short. Perfect recall matters more than bravado.</p></div>
        <div className="length-picker">{LENGTHS.map((value) => <button type="button" className={length === value ? 'active' : ''} onClick={() => setLength(value)} key={value}><b>{value}</b><span>digits</span></button>)}</div>
        <div className="challenge-readiness"><span>{Math.ceil(length / 6)} palace locations</span><span>{missingCodes.length ? `${missingCodes.length} missing codex entries` : 'Codex ready'}</span></div>
        {missingCodes.length ? <p className="form-error">Complete these PAO entries first: {missingCodes.join(', ')}</p> : <button className="primary-button" type="button" onClick={() => setPhase('encode')}>Open encoding chamber →</button>}
      </section>}

      {phase === 'encode' && <section className="encoding-chamber">
        <div className="chamber-top"><div><div className="eyebrow">Encoding phase</div><h2>{length} digits · {Math.ceil(length / 6)} scenes</h2></div><button className="primary-button" type="button" onClick={startRecall}>Hide digits & recall →</button></div>
        <div className="pi-chunks">{chunkDigits(expected).map((chunk, chunkIndex) => {
          const codes = chunkDigits(chunk, 2)
          return <article key={`${chunk}-${chunkIndex}`}><span className="locus-number">Locus {String(chunkIndex + 1).padStart(2, '0')}</span><div className="digits-line">{chunk}</div><div className="scene-parts">{codes.map((code, index) => <span key={`${code}-${index}`}><small>{['P', 'A', 'O'][index]}</small><b>{index === 0 ? progress.paoEntries[code]?.person : index === 1 ? progress.paoEntries[code]?.action : progress.paoEntries[code]?.object}</b><i>{code}</i></span>)}</div></article>
        })}</div>
      </section>}

      {phase === 'recall' && <section className="recall-chamber">
        <div className="eyebrow">Palace sealed</div><h2>Walk the route. Enter what returns.</h2><p>Spaces and punctuation are ignored.</p>
        <textarea autoFocus value={answer} onChange={(event) => setAnswer(event.target.value.replace(/\D/g, '').slice(0, length))} inputMode="numeric" placeholder="Begin with 141592…" />
        <div className="recall-counter"><span>{answer.length} / {length}</span><button className="primary-button" disabled={!answer.length} type="button" onClick={submit}>Verify recall</button></div>
      </section>}

      {phase === 'result' && <section className="sequence-result">
        <div className="result-summary"><div className="result-seal">{score.accuracy === 100 ? '✓' : `${score.accuracy}`}</div><div><div className="eyebrow">Recall report</div><h2>{score.correct} of {length} digits</h2><p>{score.accuracy}% accuracy · {elapsed} seconds</p></div></div>
        <div className="digit-comparison">{expected.split('').map((digit, index) => <span className={score.marks[index] ? 'correct' : 'wrong'} key={`${digit}-${index}`}><b>{answer[index] ?? '·'}</b><small>{score.marks[index] ? '' : digit}</small></span>)}</div>
        <div className="legend"><span><i className="correct" /> recalled</span><span><i className="wrong" /> incorrect; small digit is expected</span></div>
        <button className="primary-button" type="button" onClick={reset}>Plan the next walk →</button>
      </section>}
    </div>
  )
}
