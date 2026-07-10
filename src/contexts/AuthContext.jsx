import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [profile, setProfile]     = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          setProfile(snap.exists() ? snap.data() : null)
        } catch (e) {
          console.warn('[FieldWork] Could not load user profile from Firestore:', e.message)
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function register({ email, password, name, role }) {
    if (!auth) throw new Error('Firebase is not configured. Add your credentials to .env')
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    const userDoc = {
      uid:       cred.user.uid,
      email,
      name,
      role,
      badges:    [],
      createdAt: serverTimestamp(),
    }
    try {
      await setDoc(doc(db, 'users', cred.user.uid), userDoc)
    } catch (e) {
      // Firestore rules not yet deployed — auth account is created but profile
      // won't persist until rules are published in the Firebase console.
      console.warn('[FieldWork] Could not write user profile to Firestore:', e.message)
    }
    setProfile(userDoc)
    return cred.user
  }

  async function login(email, password) {
    if (!auth) throw new Error('Firebase is not configured. Add your credentials to .env')
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function loginWithGoogle() {
    if (!auth) throw new Error('Firebase is not configured. Add your credentials to .env')
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    try {
      const snap = await getDoc(doc(db, 'users', cred.user.uid))
      if (!snap.exists()) {
        const userDoc = {
          uid:       cred.user.uid,
          email:     cred.user.email,
          name:      cred.user.displayName,
          role:      'worker',
          badges:    [],
          createdAt: serverTimestamp(),
        }
        await setDoc(doc(db, 'users', cred.user.uid), userDoc)
        setProfile(userDoc)
      }
    } catch (e) {
      console.warn('[FieldWork] Could not load/save Google user profile:', e.message)
    }
    return cred.user
  }

  async function logout() {
    await signOut(auth)
  }

  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email)
  }

  async function createProfile({ name, role }) {
    if (!user) return
    const userDoc = { uid: user.uid, email: user.email, name, role, badges: [], createdAt: serverTimestamp() }
    await setDoc(doc(db, 'users', user.uid), userDoc)
    setProfile(userDoc)
  }

  async function refreshProfile() {
    if (!user) return
    try {
      const snap = await getDoc(doc(db, 'users', user.uid))
      setProfile(snap.exists() ? snap.data() : null)
    } catch (e) {
      console.warn('[FieldWork] Could not refresh profile:', e.message)
    }
  }

  const isEmployer    = profile?.role === 'employer'
  const isWorker      = profile?.role === 'worker'
  const isEmployerPro = profile?.plan === 'employer_pro'
  const isWorkerPro   = profile?.plan === 'worker_pro'
  const isPro         = isEmployerPro || isWorkerPro

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isEmployer,
        isWorker,
        isPro,
        isEmployerPro,
        isWorkerPro,
        register,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        refreshProfile,
        createProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
