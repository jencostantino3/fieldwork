import {
  collection, doc, addDoc, updateDoc, getDocs,
  query, where, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, storage } from '@/firebase'

const BADGES = 'badges'

export async function requestBadge({ userId, type, expiryDate, file }) {
  // Force a token refresh so Firestore sees a valid auth claim.
  // New accounts sometimes have an unrefreshed token that Firestore rejects.
  const currentUser = auth?.currentUser
  if (!currentUser) throw new Error('You must be signed in to submit a badge.')
  if (currentUser.uid !== userId) throw new Error('Auth mismatch — please sign out and back in.')
  await currentUser.getIdToken(true)

  let documentUrl = null
  if (file) {
    console.log('[FieldWork] uploading file for uid:', currentUser.uid)
    const storageRef = ref(storage, `badges/${userId}/${type}_${Date.now()}`)
    try {
      await uploadBytes(storageRef, file)
      documentUrl = await getDownloadURL(storageRef)
    } catch (e) {
      console.error('[FieldWork] Storage error:', e.code, e.message)
      throw e
    }
  }

  const ref2 = await addDoc(collection(db, BADGES), {
    userId,
    type,
    status:           'pending',
    documentUrl,
    expiryDate:       expiryDate ? Timestamp.fromDate(new Date(expiryDate)) : null,
    verificationDate: null,
    requestedAt:      serverTimestamp(),
    updatedAt:        serverTimestamp(),
  })
  return ref2.id
}

export async function getUserBadges(userId) {
  const q = query(collection(db, BADGES), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function verifyBadge(id) {
  return updateDoc(doc(db, BADGES, id), {
    status:           'verified',
    verificationDate: serverTimestamp(),
    updatedAt:        serverTimestamp(),
  })
}

export async function revokeBadge(id) {
  return updateDoc(doc(db, BADGES, id), {
    status:    'revoked',
    updatedAt: serverTimestamp(),
  })
}
