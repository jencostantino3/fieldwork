import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/firebase'

const COMPANIES = 'companies'

export async function createCompany(data, ownerId) {
  const ref2 = await addDoc(collection(db, COMPANIES), {
    ...data,
    ownerId,
    verified:  false,
    badges:    [],
    jobCount:  0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref2.id
}

export async function getCompany(id) {
  const snap = await getDoc(doc(db, COMPANIES, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getOwnerCompany(ownerId) {
  const q = query(collection(db, COMPANIES), where('ownerId', '==', ownerId))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export async function updateCompany(id, data) {
  return updateDoc(doc(db, COMPANIES, id), { ...data, updatedAt: serverTimestamp() })
}

export async function getAllCompanies() {
  const q = query(collection(db, COMPANIES), orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function uploadCompanyLogo(companyId, file) {
  const storageRef = ref(storage, `companies/${companyId}/logo`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
