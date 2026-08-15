import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore'
import { db } from '@/firebase'

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null
}

export async function getUserProfiles(uids) {
  if (!uids.length) return {}
  const unique = [...new Set(uids)]
  const profiles = await Promise.all(unique.map(getUserProfile))
  return Object.fromEntries(
    profiles.filter(Boolean).map((p) => [p.uid, p])
  )
}
