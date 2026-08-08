import {
  collection, doc, addDoc, updateDoc, query, where, onSnapshot,
  serverTimestamp, Timestamp, writeBatch, getDocs, limit, orderBy,
} from 'firebase/firestore'
import { db } from '@/firebase'

const HOLDS = 'rapidFillHolds'
const JOBS  = 'jobs'

export async function toggleRapidFill(jobId, enabled) {
  return updateDoc(doc(db, JOBS, jobId), {
    rapidFill:            enabled,
    rapidFillActivatedAt: enabled ? serverTimestamp() : null,
    updatedAt:            serverTimestamp(),
  })
}

export async function claimRapidFill(jobId, worker) {
  // Enforce one active hold per worker across all jobs
  const existingSnap = await getDocs(query(
    collection(db, HOLDS),
    where('workerId', '==', worker.uid),
    where('status', '==', 'pending'),
    limit(1)
  ))
  if (!existingSnap.empty) {
    const existing = existingSnap.docs[0].data()
    if (existing.jobId !== jobId) {
      throw new Error('You already have an active hold on another position. Wait for it to resolve first.')
    }
    return { holdId: existingSnap.docs[0].id }
  }

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
  const ref = await addDoc(collection(db, HOLDS), {
    jobId,
    workerId:    worker.uid,
    workerName:  worker.name || 'Unknown',
    workerEmail: worker.email || '',
    status:      'pending',
    createdAt:   serverTimestamp(),
    expiresAt:   Timestamp.fromDate(expiresAt),
    notifiedAt:  null,
  })
  return { holdId: ref.id, expiresAt }
}

export async function confirmRapidFillWorker(holdId, jobId) {
  // Reject all other pending holds for this job before confirming
  const othersSnap = await getDocs(query(
    collection(db, HOLDS),
    where('jobId', '==', jobId),
    where('status', '==', 'pending')
  ))

  const batch = writeBatch(db)
  othersSnap.docs.forEach((d) => {
    if (d.id !== holdId) {
      batch.update(d.ref, { status: 'rejected', notifiedAt: serverTimestamp() })
    }
  })
  batch.update(doc(db, HOLDS, holdId), {
    status:     'confirmed',
    notifiedAt: serverTimestamp(),
  })
  batch.update(doc(db, JOBS, jobId), {
    rapidFill:            false,
    rapidFillActivatedAt: null,
    updatedAt:            serverTimestamp(),
  })
  return batch.commit()
}

export function subscribeToJobHolds(jobId, callback) {
  return onSnapshot(
    query(
      collection(db, HOLDS),
      where('jobId', '==', jobId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc')
    ),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export function subscribeToWorkerHoldsForJob(workerId, jobId, callback) {
  return onSnapshot(
    query(
      collection(db, HOLDS),
      where('workerId', '==', workerId),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc'),
      limit(1)
    ),
    (snap) => callback(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() })
  )
}
