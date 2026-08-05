import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import { AppShell } from './components/AppShell'
import { useAuth } from './contexts/AuthContext'
import { ProgressProvider } from './contexts/ProgressContext'
import { Navigate, useLocation } from './lib/router'
import './App.css'

const LandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })))
const RoadmapPage = lazy(() => import('./pages/RoadmapPage').then((module) => ({ default: module.RoadmapPage })))
const MajorLessonPage = lazy(() => import('./pages/MajorLessonPage').then((module) => ({ default: module.MajorLessonPage })))
const MajorDrillPage = lazy(() => import('./pages/MajorDrillPage').then((module) => ({ default: module.MajorDrillPage })))
const PaoCodexPage = lazy(() => import('./pages/PaoCodexPage').then((module) => ({ default: module.PaoCodexPage })))
const PaoDrillPage = lazy(() => import('./pages/PaoDrillPage').then((module) => ({ default: module.PaoDrillPage })))
const PiScenesPage = lazy(() => import('./pages/PiScenesPage').then((module) => ({ default: module.PiScenesPage })))
const PiRecallPage = lazy(() => import('./pages/PiRecallPage').then((module) => ({ default: module.PiRecallPage })))
const DeckCodexPage = lazy(() => import('./pages/DeckCodexPage').then((module) => ({ default: module.DeckCodexPage })))
const DeckDrillPage = lazy(() => import('./pages/DeckDrillPage').then((module) => ({ default: module.DeckDrillPage })))
const DeckScenesPage = lazy(() => import('./pages/DeckScenesPage').then((module) => ({ default: module.DeckScenesPage })))
const DeckRecallPage = lazy(() => import('./pages/DeckRecallPage').then((module) => ({ default: module.DeckRecallPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })))

const PAGES: Record<string, LazyExoticComponent<ComponentType>> = {
  '/map': RoadmapPage,
  '/quest/major': MajorLessonPage,
  '/quest/major-drill': MajorDrillPage,
  '/quest/pao-codex': PaoCodexPage,
  '/quest/pao-drill': PaoDrillPage,
  '/quest/pi-scenes': PiScenesPage,
  '/quest/pi-recall': PiRecallPage,
  '/quest/deck-codex': DeckCodexPage,
  '/quest/deck-drill': DeckDrillPage,
  '/quest/deck-scenes': DeckScenesPage,
  '/quest/deck-recall': DeckRecallPage,
  '/profile': ProfilePage,
}

function LoadingMap() {
  return <div className="loading-screen"><span className="logo-glyph">L<i /></span><p>Unfolding the map…</p></div>
}

function AuthenticatedApp({ page: Page }: { page: LazyExoticComponent<ComponentType> }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingMap />
  if (!user) return <Navigate to="/" replace />
  return <ProgressProvider><AppShell><Page /></AppShell></ProgressProvider>
}

export default function App() {
  const { pathname } = useLocation()
  if (pathname === '/') return <Suspense fallback={<LoadingMap />}><LandingPage /></Suspense>
  const page = PAGES[pathname]
  if (!page) return <Navigate to="/" replace />
  return <Suspense fallback={<LoadingMap />}><AuthenticatedApp page={page} /></Suspense>
}
