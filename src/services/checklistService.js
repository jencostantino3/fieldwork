import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/firebase'

const RESPONSES = 'checklistResponses'

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 // target ~1-2MB after compression
const MAX_DIMENSION     = 1600 // px, longest side

function isHeic(file) {
  const type = (file.type || '').toLowerCase()
  const name = (file.name || '').toLowerCase()
  return type.includes('heic') || type.includes('heif') || name.endsWith('.heic') || name.endsWith('.heif')
}

function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload  = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read this image.'))
    img.src = URL.createObjectURL(blob)
  })
}

async function compressImage(blob) {
  const img = await loadImage(blob)
  const scale  = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width  = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
  URL.revokeObjectURL(img.src)

  let quality = 0.85
  let output  = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  while (output && output.size > MAX_UPLOAD_BYTES && quality > 0.4) {
    quality -= 0.15
    output = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  }
  return output || blob
}

// iPhones hand back HEIC/HEIF for library photos taken in the default camera
// format — convert to JPEG first since most browsers (and <img> tags outside
// Safari) can't render HEIC, then downscale/compress so uploads stay fast on
// cellular and well under the Storage rule's size cap.
export async function prepareChecklistPhoto(file) {
  let blob = file
  if (isHeic(file)) {
    try {
      // Dynamically imported — pulls in a wasm HEIC decoder (~1MB) that only
      // the (rare) HEIC-upload path needs, not every page load.
      const { default: heic2any } = await import('heic2any')
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
      blob = Array.isArray(converted) ? converted[0] : converted
    } catch {
      throw new Error('Could not convert this HEIC photo. Please try a different photo.')
    }
  }
  try {
    return await compressImage(blob)
  } catch {
    // Resizing is a nice-to-have — fall back to the (possibly HEIC-converted) original.
    return blob
  }
}

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
  const prepared   = await prepareChecklistPhoto(file)
  const storageRef = ref(storage, `checklists/${jobId}/${responseId}/${taskId}`)
  await uploadBytes(storageRef, prepared)
  return getDownloadURL(storageRef)
}

// Firebase Storage error codes -> copy a worker can actually act on, instead
// of a single generic "please try again" that hides what went wrong.
export function describeUploadError(err) {
  switch (err?.code) {
    case 'storage/unauthorized':    return 'You don’t have permission to upload this photo.'
    case 'storage/quota-exceeded':  return 'Upload failed — storage limit reached. Please contact support.'
    case 'storage/canceled':        return 'Upload canceled.'
    case 'storage/retry-limit-exceeded':
      return 'Upload timed out — check your connection and try again.'
    default:
      return err?.message || 'Could not upload photo — check your connection and try again.'
  }
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
