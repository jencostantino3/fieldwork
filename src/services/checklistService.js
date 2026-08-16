import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/firebase'

const RESPONSES = 'checklistResponses'

export async function saveChecklistTemplate(jobId, templateData) {
  return updateDoc(doc(db, 'jobs', jobId), {
    checklistTemplate: { ...templateData, updatedAt: serverTimestamp() },
    updatedAt: serverTimestamp(),
  })
}

export async function getOrCreateChecklistResponse(jobId, workerId, workerName, employerId, templateTasks) {
  const q = query(
    collection(db, RESPONSES),
    where('jobId', '==', jobId),
    where('workerId', '==', workerId)
  )
  const snap = await getDocs(q)
  if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() }

  const docRef = await addDoc(collection(db, RESPONSES), {
    jobId,
    workerId,
    workerName: workerName || '',
    employerId,
    tasks: templateTasks.map((t) => ({
      taskId:       t.taskId,
      label:        t.label,
      requiresPhoto: t.requiresPhoto,
      completed:    false,
      completedAt:  null,
      photoUrl:     null,
    })),
    startedAt:     serverTimestamp(),
    lastUpdatedAt: serverTimestamp(),
  })
  const newSnap = await getDoc(docRef)
  return { id: docRef.id, ...newSnap.data() }
}

export async function updateChecklistTasks(responseId, tasks) {
  return updateDoc(doc(db, RESPONSES, responseId), {
    tasks,
    lastUpdatedAt: serverTimestamp(),
  })
}

export async function uploadTaskPhoto(jobId, responseId, taskId, file) {
  const storageRef = ref(storage, `checklists/${jobId}/${responseId}/${taskId}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export function subscribeToJobChecklistResponses(jobId, employerId, callback) {
  const q = query(
    collection(db, RESPONSES),
    where('jobId',      '==', jobId),
    where('employerId', '==', employerId)
  )
  return onSnapshot(
    q,
    (snap) => { callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))) },
    (err)  => { console.warn('[checklist] subscribe error:', err.message); callback([]) }
  )
}

export async function getWorkerChecklistResponse(jobId, workerId) {
  const q = query(
    collection(db, RESPONSES),
    where('jobId', '==', jobId),
    where('workerId', '==', workerId)
  )
  const snap = await getDocs(q)
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }
}
