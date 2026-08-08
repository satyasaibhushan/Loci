import { useEffect, useMemo, useRef, useState, type ClipboardEvent } from 'react'
import { PageHeader } from '../components/PageHeader'
import { pairToSound } from '../data/majorSystem'
import { useAuth } from '../contexts/AuthContext'
import { useProgress } from '../contexts/ProgressContext'
import { deletePaoImage, storePaoImage, validateImageUrl } from '../lib/paoImages'
import type { PaoEntry } from '../types'

const CODES = Array.from({ length: 100 }, (_, index) => index.toString().padStart(2, '0'))
const blankEntry = (code: string): PaoEntry => ({ code, person: '', action: '', object: '', cue: '' })
const complete = (entry?: PaoEntry) => Boolean(entry?.person.trim() && entry.action.trim() && entry.object.trim())

export function PaoCodexPage() {
  const { user } = useAuth()
  const { progress, updatePaoEntry, completeQuest } = useProgress()
  const [selected, setSelected] = useState('00')
  const [draft, setDraft] = useState<PaoEntry>(() => progress.paoEntries['00'] ?? blankEntry('00'))
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [imageError, setImageError] = useState('')
  const [imageBusy, setImageBusy] = useState(false)
  const [imageUrlDraft, setImageUrlDraft] = useState('')
  const [draggingImage, setDraggingImage] = useState(false)
  const [previewFailed, setPreviewFailed] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const completedCount = CODES.filter((code) => complete(progress.paoEntries[code])).length

  useEffect(() => { setDraft(progress.paoEntries[selected] ?? blankEntry(selected)) }, [selected, progress.paoEntries])
  useEffect(() => { setImageError(''); setImageUrlDraft(''); setPreviewFailed(false) }, [selected, draft.imageUrl])
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

  const persistDraft = (next: PaoEntry, message: string) => {
    setDraft(next)
    updatePaoEntry(next)
    setNotice(message)
    window.setTimeout(() => setNotice(''), 1600)
  }

  const attachImage = async (file?: File) => {
    if (!file || !user || imageBusy) return
    setImageBusy(true)
    setImageError('')
    try {
      const stored = await storePaoImage(user, selected, file, draft.imageCustomId)
      const { imagePath: _legacyImagePath, ...withoutLegacyImage } = draft
      const next = { ...withoutLegacyImage, ...stored }
      persistDraft(next, `Image attached to ${selected}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The image could not be attached.'
      setImageError(message)
    } finally {
      setImageBusy(false)
      if (imageRef.current) imageRef.current.value = ''
    }
  }

  const attachImageUrl = async () => {
    const imageUrl = validateImageUrl(imageUrlDraft)
    if (!imageUrl) {
      setImageError('Paste a full http:// or https:// image address.')
      return
    }
    if (!user || imageBusy) return
    setImageBusy(true)
    setImageError('')
    try {
      if (draft.imageProvider === 'uploadthing') await deletePaoImage(user, selected, draft.imageCustomId)
      const { imageCustomId: _imageCustomId, imagePath: _imagePath, imageProvider: _imageProvider, ...withoutStoredImage } = draft
      persistDraft({ ...withoutStoredImage, imageUrl, imageProvider: 'external' }, `Image link attached to ${selected}`)
      setImageUrlDraft('')
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'The image link could not be attached.')
    } finally {
      setImageBusy(false)
    }
  }

  const removeImage = async () => {
    if (!user || imageBusy) return
    setImageBusy(true)
    setImageError('')
    try {
      if (draft.imageProvider === 'uploadthing') await deletePaoImage(user, selected, draft.imageCustomId)
      const { imageCustomId: _imageCustomId, imageUrl: _imageUrl, imagePath: _imagePath, imageProvider: _imageProvider, ...withoutImage } = draft
      persistDraft(withoutImage, `Image removed from ${selected}`)
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'The image could not be removed.')
    } finally {
      setImageBusy(false)
    }
  }

  const imageFromClipboard = (event: ClipboardEvent) => {
    const file = Array.from(event.clipboardData.items).find((item) => item.kind === 'file' && item.type.startsWith('image/'))?.getAsFile()
    if (!file) return
    event.preventDefault()
    void attachImage(file)
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
    <div className="codex-page wide-page page-enter" onPasteCapture={imageFromClipboard}>
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
            return <button key={code} type="button" onClick={() => setSelected(code)} className={`${selected === code ? 'selected' : ''} ${entry?.imageUrl ? 'has-image' : ''} ${complete(entry) ? 'complete' : entry && (entry.person || entry.action || entry.object) ? 'partial' : ''}`}>
              {entry?.imageUrl && <img src={entry.imageUrl} alt="" loading="lazy" />}
              <b>{code}</b><span>{entry?.person || pairToSound(code)}</span>
            </button>
          })}
        </section>

        <aside className="codex-editor">
          <div className="entry-heading"><div className="entry-number">{selected}</div><div><span>Major cue</span><b>{pairToSound(selected)}</b></div></div>
          <p className="editor-intro">Choose a person you see instantly. Their natural signature action and object become this number’s permanent trio.</p>
          <input ref={imageRef} hidden type="file" accept="image/*" onChange={(event) => void attachImage(event.target.files?.[0])} />
          <section
            className={`memory-portrait ${draggingImage ? 'dragging' : ''} ${draft.imageUrl ? 'filled' : ''}`}
            onDragEnter={(event) => { event.preventDefault(); setDraggingImage(true) }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDraggingImage(false)}
            onDrop={(event) => { event.preventDefault(); setDraggingImage(false); void attachImage(event.dataTransfer.files[0]) }}
            aria-label={`Visual anchor for ${selected}`}
          >
            {draft.imageUrl && !previewFailed ? (
              <>
                <img className="portrait-backdrop" src={draft.imageUrl} alt="" aria-hidden="true" />
                <img className="portrait-image" src={draft.imageUrl} alt={draft.person ? `${draft.person}, visual anchor for ${selected}` : `Visual anchor for ${selected}`} onError={() => setPreviewFailed(true)} />
              </>
            ) : (
              <button type="button" className="portrait-empty" onClick={() => imageRef.current?.click()} disabled={imageBusy}>
                <span className="portrait-glyph">◈</span>
                <b>{previewFailed ? 'Preview unavailable' : 'Give this number a face'}</b>
                <small>{previewFailed ? 'Replace the image or check its URL' : 'Drop, paste ⌘V, or choose an image'}</small>
              </button>
            )}
            <span className="portrait-code">{selected}</span>
            {draft.imageUrl && !previewFailed && <span className="portrait-caption">Visual anchor · {draft.person || 'unnamed'}</span>}
          </section>
          <div className="image-actions">
            <button className="quiet-button" type="button" onClick={() => imageRef.current?.click()} disabled={imageBusy}>{draft.imageUrl ? 'Replace image' : 'Choose image'}</button>
            {draft.imageUrl && <button className="text-button danger-text" type="button" onClick={() => void removeImage()} disabled={imageBusy}>Remove</button>}
            <span>{imageBusy ? 'Preparing image…' : user?.isDemo ? 'Saved on this device' : 'Synced to your account'}</span>
          </div>
          <div className="image-url-row">
            <input value={imageUrlDraft} onChange={(event) => setImageUrlDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void attachImageUrl() } }} placeholder="Or paste a direct image URL" aria-label="Direct image URL" />
            <button type="button" onClick={() => void attachImageUrl()} disabled={imageBusy || !imageUrlDraft.trim()}>Attach</button>
          </div>
          {imageError && <div className="image-error" role="alert">{imageError}</div>}
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
