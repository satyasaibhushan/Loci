import { useEffect, type ReactNode } from 'react'
import { NavLink, useLocation } from '../lib/router'
import { Logo } from './Logo'
import { useAuth } from '../contexts/AuthContext'
import { useProgress } from '../contexts/ProgressContext'

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()
  const { xp, saving, progress } = useProgress()
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="app-frame">
      <header className="topbar">
        <Logo />
        <nav className="topnav" aria-label="Primary navigation">
          <NavLink to="/map">Expedition map</NavLink>
          <NavLink to="/quest/pao-codex">PAO codex</NavLink>
          <NavLink to="/profile">Field notes</NavLink>
        </nav>
        <div className="profile-cluster">
          <span className="save-state">{saving ? 'Saving…' : 'Saved'}</span>
          <span className="xp-chip"><b>{xp}</b> XP</span>
          <button className="avatar-button" type="button" onClick={() => void signOut()} title="Sign out">
            {user?.photoURL ? <img src={user.photoURL} alt="" /> : <span>{user?.displayName.slice(0, 1).toUpperCase()}</span>}
          </button>
        </div>
      </header>

      <main className="app-main" key={location.pathname}>
        {children}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <NavLink to="/map"><span>⌖</span>Map</NavLink>
        <NavLink to="/quest/pao-codex"><span>◫</span>Codex</NavLink>
        <NavLink to="/profile"><span>✦</span>Notes</NavLink>
      </nav>
      <div className="grain" aria-hidden="true" />
      <div className="progress-whisper" aria-hidden="true">{progress.completedQuests.length}/10</div>
    </div>
  )
}
