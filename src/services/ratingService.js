import {
  collection, addDoc, getDocs, query, where,
  doc, updateDoc, getDoc, runTransaction, serverTimestamp, arrayUnion,
} from 'firebase/firestore'
import { db } from '@/firebase'

const RATINGS = 'ratings'
const USERS   = 'users'

export const MIN_RATINGS_TO_SHOW = 3

export async function submitRating({ fromUid, toUid, jobId, stars, tag, ratedRole }) {
  await addDoc(collection(db, RATINGS), {
    fromUid,
    toUid,
    jobId,
    stars,
    tag:       tag || null,
    ratedRole,
    createdAt: serverTimestamp(),
  })

  const userRef = doc(db, USERS, toUid)
  await runTransaction(db, async (tx) => {
    const snap   = await tx.get(userRef)
    const stats  = snap.data()?.ratingStats ?? { average: 0, count: 0 }
    const newCount   = stats.count + 1
    const newAverage = ((stats.average * stats.count) + stars) / newCount
    tx.update(userRef, { ratingStats: { average: newAverage, count: newCount } })
  })
}

export async function skipRating(uid, jobId) {
  await updateDoc(doc(db, USERS, uid), { ratingsSkipped: arrayUnion(jobId) })
}

export async function hasInteractedWithRating(uid, jobId) {
  const q    = query(collection(db, RATINGS), where('fromUid', '==', uid), where('jobId', '==', jobId))
  const snap = await getDocs(q)
  if (!snap.empty) return true
  const userSnap = await getDoc(doc(db, USERS, uid))
  const skipped  = userSnap.data()?.ratingsSkipped ?? []
  return skipped.includes(jobId)
}

export async function getRatingStats(uid) {
  const snap  = await getDoc(doc(db, USERS, uid))
  const stats = snap.data()?.ratingStats
  if (!stats || stats.count < MIN_RATINGS_TO_SHOW) return null
  return { average: Math.round(stats.average * 10) / 10, count: stats.count }
}

export function formatRating(ratingStats) {
  if (!ratingStats || ratingStats.count < MIN_RATINGS_TO_SHOW) return null
  return { average: Math.round(ratingStats.average * 10) / 10, count: ratingStats.count }
}
