// Deletes every isDemo: true record created by scripts/seedDemoData.mjs (and any
// isDemo-tagged demoMessages written by the notifications service). Uses the same
// client Firebase SDK as the app — every delete runs as the owning account's own
// session, matching firestore.rules exactly. Run from the repo root:
// node scripts/cleanupDemoData.mjs
import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser, signOut,
} from 'firebase/auth'
import {
  getFirestore, collection, query, where, getDocs, deleteDoc, doc, setDoc, serverTimestamp,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
}
const app  = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db   = getFirestore(app)

const SEED_PASSWORD = 'DemoPass123!'

async function demoDocs(collectionName) {
  const snap = await getDocs(query(collection(db, collectionName), where('isDemo', '==', true)))
  return snap.docs.map((d) => ({ id: d.id, ref: d.ref, ...d.data() }))
}

// Bootstrap: need to be signed in as *someone* to list collections (rules require isSignedIn()).
const bootEmail = `cleanup-bootstrap-${Date.now()}@stafftheame.demo`
const bootCred = await createUserWithEmailAndPassword(auth, bootEmail, SEED_PASSWORD)
await setDoc(doc(db, 'users', bootCred.user.uid), {
  uid: bootCred.user.uid, email: bootEmail, name: 'Cleanup Bootstrap', role: 'worker',
  badges: [], createdAt: serverTimestamp(),
})

console.log('--- Finding isDemo: true records')
const [demoUsers, demoJobs, demoCompanies, demoMessages] = await Promise.all([
  demoDocs('users'), demoDocs('jobs'), demoDocs('companies'), demoDocs('demoMessages'),
])
console.log(`  users: ${demoUsers.length}, jobs: ${demoJobs.length}, companies: ${demoCompanies.length}, demoMessages: ${demoMessages.length}`)

console.log('--- Deleting demoMessages (any signed-in account may delete these)')
for (const m of demoMessages) await deleteDoc(m.ref)

const employers = demoUsers.filter((u) => u.role === 'employer')
const workers    = demoUsers.filter((u) => u.role !== 'employer')

console.log('--- Deleting employer-owned jobs, companies, then the employer accounts themselves')
for (const emp of employers) {
  try {
    await signInWithEmailAndPassword(auth, emp.email, SEED_PASSWORD)
    const ownJobs      = demoJobs.filter((j) => j.employerId === emp.id)
    const ownCompanies = demoCompanies.filter((c) => c.ownerId === emp.id)
    for (const j of ownJobs) await deleteDoc(j.ref)
    for (const c of ownCompanies) await deleteDoc(c.ref)
    await deleteDoc(doc(db, 'users', emp.id))
    await deleteUser(auth.currentUser)
    console.log(`  removed ${emp.email} (${ownJobs.length} job(s), ${ownCompanies.length} company doc(s))`)
  } catch (e) {
    console.error('  failed to remove', emp.email, '-', e.code || e.message)
  }
}

console.log('--- Deleting worker accounts')
for (const w of workers) {
  try {
    await signInWithEmailAndPassword(auth, w.email, SEED_PASSWORD)
    await deleteDoc(doc(db, 'users', w.id))
    await deleteUser(auth.currentUser)
    console.log('  removed', w.email)
  } catch (e) {
    console.error('  failed to remove', w.email, '-', e.code || e.message)
  }
}

console.log('--- Removing cleanup bootstrap account')
await signInWithEmailAndPassword(auth, bootEmail, SEED_PASSWORD)
await deleteDoc(doc(db, 'users', bootCred.user.uid))
await deleteUser(auth.currentUser)
await signOut(auth).catch(() => {})

console.log('\nDone — all isDemo: true records removed.')
process.exit(0)
