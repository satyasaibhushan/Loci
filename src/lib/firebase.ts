import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore/lite'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
)

interface FirebaseServices { app: FirebaseApp; auth: Auth; db: Firestore }
let services: Promise<FirebaseServices> | undefined

export function getFirebaseServices(): Promise<FirebaseServices> {
  if (!isFirebaseConfigured) return Promise.reject(new Error('Firebase is not configured.'))
  if (!services) {
    services = Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore/lite')]).then(([appModule, authModule, firestoreModule]) => {
      const app = appModule.getApps()[0] ?? appModule.initializeApp(firebaseConfig)
      return { app, auth: authModule.getAuth(app), db: firestoreModule.getFirestore(app) }
    })
  }
  return services
}
