import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, where, orderBy, limit, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { haversineDistance, getBoundingBox } from '@/utils/helpers'

const JOBS = 'jobs'

export async function createJob(data, employerId) {
  const ref = await addDoc(collection(db, JOBS), {
    ...data,
    employerId,
    status:           'active',
    applicationCount: 0,
    urgent:           false,
    boostExpiry:      null,
    createdAt:        serverTimestamp(),
    updatedAt:        serverTimestamp(),
  })
  return ref.id
}

export async function getJob(id) {
  const snap = await getDoc(doc(db, JOBS, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateJob(id, data) {
  return updateDoc(doc(db, JOBS, id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteJob(id) {
  return deleteDoc(doc(db, JOBS, id))
}

export async function getEmployerJobs(employerId) {
  const q = query(
    collection(db, JOBS),
    where('employerId', '==', employerId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function fetchJobs({ sport, jobType, category, coords, radiusMiles, onlyUrgent } = {}) {
  let q = query(collection(db, JOBS), where('status', '==', 'active'))

  if (sport)    q = query(q, where('sport', '==', sport))
  if (jobType)  q = query(q, where('jobType', '==', jobType))
  if (category) q = query(q, where('category', '==', category))

  const snap = await getDocs(query(q, orderBy('urgent', 'desc'), orderBy('createdAt', 'desc'), limit(200)))
  let jobs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  if (coords && radiusMiles) {
    const box = getBoundingBox(coords.lat, coords.lng, radiusMiles)
    jobs = jobs.filter((j) => {
      if (!j.coordinates) return false
      const { lat, lng } = j.coordinates
      if (lat < box.minLat || lat > box.maxLat || lng < box.minLng || lng > box.maxLng) return false
      const dist = haversineDistance(coords.lat, coords.lng, lat, lng)
      return dist <= radiusMiles
    })
  }

  if (onlyUrgent) jobs = jobs.filter((j) => j.urgent)

  return jobs
}

export async function boostJob(jobId, hours = 48) {
  const expiry = new Date(Date.now() + hours * 60 * 60 * 1000)
  return updateDoc(doc(db, JOBS, jobId), {
    urgent:      true,
    boostExpiry: Timestamp.fromDate(expiry),
    updatedAt:   serverTimestamp(),
  })
}
