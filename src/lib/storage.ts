import { getFirebaseServices, isFirebaseConfigured } from './firebase'
import { createInitialProgress, hydrateProgress } from './progress'
import type { ProgressState } from '../types'

const storageKey = (uid: string) => `loci-progress:${uid}`

function loadLocal(uid: string): ProgressState {
  const saved = window.localStorage.getItem(storageKey(uid))
  if (!saved) return createInitialProgress()
  try {
    return hydrateProgress(JSON.parse(saved))
  } catch {
    return createInitialProgress()
  }
}

export async function loadProgress(uid: string, isDemo: boolean): Promise<ProgressState> {
  if (isDemo || !isFirebaseConfigured) return loadLocal(uid)
  try {
    const [{ db }, { doc, getDoc }] = await Promise.all([getFirebaseServices(), import('firebase/firestore/lite')])
    const snapshot = await getDoc(doc(db, 'users', uid))
    if (snapshot.exists()) return hydrateProgress(snapshot.data().progress)
  } catch {
    return loadLocal(uid)
  }
  return createInitialProgress()
}

export async function saveProgress(uid: string, isDemo: boolean, progress: ProgressState): Promise<void> {
  window.localStorage.setItem(storageKey(uid), JSON.stringify(progress))
  if (isDemo || !isFirebaseConfigured) return
  const [{ db }, { doc, serverTimestamp, setDoc }] = await Promise.all([getFirebaseServices(), import('firebase/firestore/lite')])
  await setDoc(
    doc(db, 'users', uid),
    { progress, updatedAt: serverTimestamp() },
    { merge: true },
  )
}
