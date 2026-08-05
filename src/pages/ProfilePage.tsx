import { useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProgress } from '../contexts/ProgressContext'
import { createInitialProgress } from '../lib/progress'
import { hydrateProgress } from '../lib/progress'

export function ProfilePage() {
  const { user, firebaseConfigured, signOut } = useAuth()
  const { progress, xp, replaceProgress } = useProgress()
  const [notice, setNotice] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const paoCount = Object.values(progress.paoEntries).filter((entry) => entry.person && entry.action && entry.object).length
  const cardCount = Object.values(progress.cardEntries).filter((entry) => entry.person).length

  const exportData = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' })
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'loci-expedition.json'; link.click(); URL.revokeObjectURL(link.href)
  }
  const importData = async (file?: File) => {
    if (!file) return
    try { replaceProgress(hydrateProgress(JSON.parse(await file.text()))); setNotice('Expedition restored') } catch { setNotice('That file is not valid Loci data') }
  }
  const reset = () => {
    if (!window.confirm('Reset every quest, codex entry and result for this account? This cannot be undone unless you exported a backup.')) return
    replaceProgress(createInitialProgress()); setNotice('Expedition reset')
  }

  return <div className="profile-page narrow-page page-enter"><header className="profile-hero"><div className="profile-avatar">{user?.photoURL ? <img src={user.photoURL} alt="" /> : user?.displayName.slice(0, 1)}</div><div><div className="eyebrow">Field notes</div><h1>{user?.displayName}</h1><p>{user?.isDemo ? 'Local explorer · progress stays on this device' : user?.email}</p></div></header>
    <section className="profile-stats"><article><small>Rank</small><b>{xp < 500 ? 'Wayfinder' : xp < 1500 ? 'Cartographer' : 'Mnemonist'}</b><span>{xp} XP</span></article><article><small>Shared codex</small><b>{paoCount}<i>/100</i></b><span>PAO trios complete</span></article><article><small>Card cast</small><b>{cardCount}<i>/52</i></b><span>characters defined</span></article></section>
    <section className="field-panel"><div><h2>Expedition data</h2><p>Google accounts sync through Firestore. Exports remain useful as portable backups.</p></div><div className="button-row"><input hidden ref={inputRef} type="file" accept="application/json" onChange={(event) => void importData(event.target.files?.[0])} /><button className="secondary-button" type="button" onClick={() => inputRef.current?.click()}>Import backup</button><button className="primary-button" type="button" onClick={exportData}>Export backup</button></div>{notice && <div className="notice">{notice}</div>}</section>
    <section className="field-panel"><div><h2>Connection</h2><p>{firebaseConfigured ? 'Firebase is configured. Google identity and cloud progress are available.' : 'Firebase is not configured in this environment. Local preview remains available.'}</p></div><button className="secondary-button" type="button" onClick={() => void signOut()}>Sign out</button></section>
    <section className="danger-panel"><div><h2>Start over</h2><p>Clear your codebooks, XP, drills and challenge history.</p></div><button type="button" onClick={reset}>Reset expedition</button></section>
  </div>
}
