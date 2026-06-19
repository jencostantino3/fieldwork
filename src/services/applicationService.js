import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'

const APPLICATIONS = 'applications'

export async function submitApplication({ jobId, userId, answers }) {
  const ref = await addDoc(collection(db, APPLICATIONS), {
    jobId,
    userId,
    answers,
    status:    'pending',
    notes:     '',
    appliedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function getApplication(id) {
  const snap = await getDoc(doc(db, APPLICATIONS, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getUserApplications(userId) {
  const q = query(
    collection(db, APPLICATIONS),
    where('userId', '==', userId),
    orderBy('appliedAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getJobApplications(jobId) {
  const q = query(
    collection(db, APPLICATIONS),
    where('jobId', '==', jobId),
    orderBy('appliedAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function updateApplicationStatus(id, status, notes = '') {
  return updateDoc(doc(db, APPLICATIONS, id), {
    status,
    notes,
    updatedAt: serverTimestamp(),
  })
}

export async function hasApplied(jobId, userId) {
  const q = query(
    collection(db, APPLICATIONS),
    where('jobId', '==', jobId),
    where('userId', '==', userId)
  )
  const snap = await getDocs(q)
  return !snap.empty
}
