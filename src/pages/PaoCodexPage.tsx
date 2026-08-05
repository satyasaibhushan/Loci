import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { pairToSound } from '../data/majorSystem'
import { useProgress } from '../contexts/ProgressContext'
import type { PaoEntry } from '../types'

const CODES = Array.from({ length: 100 }, (_, index) => index.toString().padStart(2, '0'))
const blankEntry = (code: string): PaoEntry => ({ code, person: '', action: '', object: '', cue: '' })
const complete = (entry?: PaoEntry) => Boolean(entry?.person.trim() && entry.action.trim() && entry.object.trim())

export function PaoCodexPage() {
  const { progress, updatePaoEntry, completeQuest } = useProgress()
  const [selected, setSelected] = useState('00')
  const [draft, setDraft] = useState<PaoEntry>(() => progress.paoEntries['00'] ?? blankEntry('00'))
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const importRef = useRef<HTMLInputElement>(null)
  const completedCount = CODES.filter((code) => complete(progress.paoEntries[code])).length

  useEffect(() => { setDraft(progress.paoEntries[selected] ?? blankEntry(selected)) }, [selected, progress.paoEntries])
  useEffect(() => { if (completedCount === 100) completeQuest('pao-codex') }, [completedCount, completeQuest])

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return needle ? CODES.filter((code) => {
      const entry = progress.paoEntries[code]
      return code.includes(needle) || [entry?.person, entry?.action, entry?.object].some((value) => value?.toLowerCase().includes(needle))
    }) : CODES
  }, [search, progress.paoEntries])

  const duplicates = useMemo(() => {
    const values = Object.values(progress.paoEntries).flatMap((entry) => [entry.person, entry.action, entry.object]).filter(Boolean).map((value) => value.trim().toLowerCase())
    return new Set(values.filter((value, index) => values.indexOf(value) !== index))
  }, [progress.paoEntries])

  const save = () => {
    updatePaoEntry({ ...draft, person: draft.person.trim(), action: draft.action.trim(), object: draft.object.trim(), cue: draft.cue?.trim() })
    setNotice(`Entry ${selected} saved`)
    window.setTimeout(() => setNotice(''), 1600)
  }

  const exportCodex = () => {
    const blob = new Blob([JSON.stringify(progress.paoEntries, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'loci-pao-codex.json'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const importCodex = async (file?: File) => {
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as Record<string, PaoEntry>
      CODES.forEach((code) => { if (parsed[code]?.code === code) updatePaoEntry(parsed[code]) })
      setNotice('Codex imported')
    } catch { setNotice('That file is not a valid Loci codex') }
  }

  return (
    <div className="codex-page wide-page page-enter">
      <PageHeader eyebrow="Shared path · Level 3" title="The PAO Codex" description="You choose the cast. Loci guards its consistency and trains the connection until it is automatic." meta={`${completedCount} / 100 complete`} />

      <div className="codex-toolbar">
        <label className="search-field"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search number, person, action or object" /></label>
        <div className="toolbar-actions">
          <input ref={importRef} hidden type="file" accept="application/json" onChange={(event) => void importCodex(event.target.files?.[0])} />
          <button className="quiet-button" type="button" onClick={() => importRef.current?.click()}>Import</button>
          <button className="quiet-button" type="button" onClick={exportCodex}>Export</button>
        </div>
      </div>

      <div className="codex-layout">
        <section className="number-grid" aria-label="100 PAO entries">
          {filtered.map((code) => {
            const entry = progress.paoEntries[code]
            return <button key={code} type="button" onClick={() => setSelected(code)} className={`${selected === code ? 'selected' : ''} ${complete(entry) ? 'complete' : entry && (entry.person || entry.action || entry.object) ? 'partial' : ''}`}><b>{code}</b><span>{entry?.person || pairToSound(code)}</span></button>
          })}
        </section>

        <aside className="codex-editor">
          <div className="entry-heading"><div className="entry-number">{selected}</div><div><span>Major cue</span><b>{pairToSound(selected)}</b></div></div>
          <p className="editor-intro">Choose a person you see instantly. Their natural signature action and object become this number’s permanent trio.</p>
          <label><span>Person <i>P</i></span><input value={draft.person} onChange={(event) => setDraft({ ...draft, person: event.target.value })} placeholder="e.g. Thor" autoFocus /></label>
          <label><span>Signature action <i>A</i></span><input value={draft.action} onChange={(event) => setDraft({ ...draft, action: event.target.value })} placeholder="e.g. swings" /></label>
          <label><span>Signature object <i>O</i></span><input value={draft.object} onChange={(event) => setDraft({ ...draft, object: event.target.value })} placeholder="e.g. hammer" /></label>
          <label><span>Optional Major cue</span><input value={draft.cue ?? ''} onChange={(event) => setDraft({ ...draft, cue: event.target.value })} placeholder="Why this person belongs to this number" /></label>
          {duplicates.has(draft.person.trim().toLowerCase()) && draft.person && <div className="collision-note">This value appears elsewhere. Distinct images decode more reliably.</div>}
          <button className="primary-button full-button" type="button" onClick={save}>Save entry {selected}</button>
          <div className="editor-foot"><span>{complete(draft) ? '● Complete trio' : '○ Needs all three fields'}</span><small>{notice}</small></div>
        </aside>
      </div>
    </div>
  )
}
