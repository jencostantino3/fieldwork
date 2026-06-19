import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

let app       = null
let auth      = null
let db        = null
let storage   = null
let functions = null

if (import.meta.env.VITE_FIREBASE_API_KEY) {
  try {
    app       = initializeApp(firebaseConfig)
    auth      = getAuth(app)
    db        = getFirestore(app)
    storage   = getStorage(app)
    functions = getFunctions(app)
    isSupported().then((yes) => yes && getAnalytics(app))
  } catch (e) {
    console.warn('[FieldWork] Firebase init failed:', e.message)
  }
} else {
  console.info('[FieldWork] No Firebase config — running in demo mode.')
}

export { auth, db, storage, functions }
export default app
