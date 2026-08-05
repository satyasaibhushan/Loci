/* oxlint-disable react/only-export-components */
import type { User } from 'firebase/auth'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getFirebaseServices, isFirebaseConfigured } from '../lib/firebase'
import type { AppUser } from '../types'

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  error: string
  firebaseConfigured: boolean
  signInWithGoogle: () => Promise<void>
  enterDemo: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const DEMO_USER: AppUser = {
  uid: 'local-explorer',
  displayName: 'Explorer',
  email: 'local@loci.app',
  isDemo: true,
}

function toAppUser(user: User): AppUser {
  return {
    uid: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Explorer',
    email: user.email ?? '',
    photoURL: user.photoURL ?? undefined,
    isDemo: false,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (window.localStorage.getItem('loci-demo-session') === 'true') {
      setUser(DEMO_USER)
      setLoading(false)
      return
    }
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }
    let unsubscribe: (() => void) | undefined
    void Promise.all([getFirebaseServices(), import('firebase/auth')]).then(([{ auth }, authModule]) => {
      void authModule.getRedirectResult(auth).catch(() => undefined)
      unsubscribe = authModule.onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser ? toAppUser(firebaseUser) : null)
        setLoading(false)
      })
    }).catch(() => setLoading(false))
    return () => unsubscribe?.()
  }, [])

  const signInWithGoogle = async () => {
    setError('')
    if (!isFirebaseConfigured) {
      setError('Firebase is not configured yet. Add the environment values or use local preview.')
      return
    }
    try {
      const [{ auth }, authModule] = await Promise.all([getFirebaseServices(), import('firebase/auth')])
      const provider = new authModule.GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      if (window.matchMedia('(max-width: 700px)').matches) {
        await authModule.signInWithRedirect(auth, provider)
      } else {
        await authModule.signInWithPopup(auth, provider)
      }
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Google sign-in could not be completed.')
    }
  }

  const enterDemo = () => {
    window.localStorage.setItem('loci-demo-session', 'true')
    setUser(DEMO_USER)
  }

  const signOut = async () => {
    window.localStorage.removeItem('loci-demo-session')
    if (isFirebaseConfigured && user && !user.isDemo) {
      const [{ auth }, authModule] = await Promise.all([getFirebaseServices(), import('firebase/auth')])
      await authModule.signOut(auth)
    }
    setUser(null)
  }

  const value = { user, loading, error, firebaseConfigured: isFirebaseConfigured, signInWithGoogle, enterDemo, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
