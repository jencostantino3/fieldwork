// Seeds realistic demo data for the live presentation: 2 employers, ~18 workers,
// and a handful of job postings covering regular/Boosted/Rapid Fill/event-checklist.
// Uses the same client Firebase SDK the app uses (not firebase-admin) so every write
// goes through the exact auth + Firestore rules path a real signup would — no service
// account needed. Run from the repo root: node scripts/seedDemoData.mjs
import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
} from 'firebase/auth'
import {
  getFirestore, doc, setDoc, serverTimestamp, collection, addDoc, Timestamp, getDocs, query, where,
} from 'firebase/firestore'
import { ROLE_CATEGORIES } from '../src/config/roleCategories.js'

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

const PASSWORD = 'DemoPass123!'
const RUN_TAG  = Date.now() // keeps emails unique across repeated seed runs

// Towns clustered around western/central MA so the Rapid Fill area-match has
// real overlap to show off during the demo.
const TOWNS = [
  { city: 'Springfield',   state: 'MA', zip: '01103', lat: 42.1015, lng: -72.5898 },
  { city: 'Northampton',   state: 'MA', zip: '01060', lat: 42.3251, lng: -72.6412 },
  { city: 'Holyoke',       state: 'MA', zip: '01040', lat: 42.2042, lng: -72.6162 },
  { city: 'Chicopee',      state: 'MA', zip: '01013', lat: 42.1487, lng: -72.6079 },
  { city: 'West Springfield', state: 'MA', zip: '01089', lat: 42.1070, lng: -72.6412 },
  { city: 'Pittsfield',    state: 'MA', zip: '01201', lat: 42.4501, lng: -73.2454 },
]

const FIRST_NAMES = [
  'Jordan', 'Casey', 'Morgan', 'Taylor', 'Alex', 'Sam', 'Jamie', 'Riley',
  'Avery', 'Drew', 'Cameron', 'Quinn', 'Reese', 'Dakota', 'Hayden', 'Rowan',
  'Marcus', 'Elena', 'DeShawn', 'Priya',
]
const LAST_NAMES = [
  'Martinez', 'Johnson', 'OBrien', 'Nguyen', 'Garcia', 'Smith', 'Lefebvre', 'Rossi',
  'Washington', 'Kowalski', 'Alvarez', 'Chen', 'Dubois', 'Patel', 'Murphy', 'Santos',
  'Okafor', 'Costa', 'Bergeron', 'Kim',
]

const SPORTS = ['baseball', 'softball']
const EXPERIENCE_LEVELS = ['high_school', 'collegiate', 'professional']

// All roles across every category, so "mix of roles from the role config" has real variety.
const ALL_ROLES = ROLE_CATEGORIES.flatMap((c) => c.roles)

function pick(arr, i) { return arr[i % arr.length] }
function randBetween(min, max) { return Math.random() * (max - min) + min }
function randInt(min, max) { return Math.floor(randBetween(min, max + 1)) }
function jitter(coord, miles = 8) {
  const deg = miles / 69
  return { lat: coord.lat + randBetween(-deg, deg), lng: coord.lng + randBetween(-deg, deg) }
}

async function createAccount(email, password, userDoc) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await setDoc(doc(db, 'users', cred.user.uid), { uid: cred.user.uid, ...userDoc, createdAt: serverTimestamp() })
  return cred.user.uid
}

function svgLogo(initials, bg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="24" fill="${bg}"/><text x="50%" y="55%" font-family="Arial, sans-serif" font-size="48" font-weight="700" fill="#fff" text-anchor="middle">${initials}</text></svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

// ─── Employers ────────────────────────────────────────────────────────────────

const employers = [
  { orgName: 'Pioneer Valley Baseball League', sport: 'baseball', logo: svgLogo('PV', '#1976D2') },
  { orgName: 'Berkshire Softball Alliance',    sport: 'softball', logo: null },
]

console.log('--- Creating employer accounts')
const employerIds = []
for (const [i, e] of employers.entries()) {
  const email = `demo-employer-${i + 1}-${RUN_TAG}@staffthegame.demo`
  const uid = await createAccount(email, PASSWORD, {
    email, name: `${e.orgName} Staff`, role: 'employer', orgName: e.orgName,
    plan: 'employer_elite', badges: [], isDemo: true,
  })
  const companyRef = await addDoc(collection(db, 'companies'), {
    name: e.orgName, sport: e.sport, description: `Running youth and adult ${e.sport} programs across the Pioneer Valley.`,
    ownerId: uid, verified: true, badges: [], jobCount: 0, isDemo: true,
    ...(e.logo ? { logoUrl: e.logo } : {}),
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  employerIds.push({ uid, email, orgName: e.orgName, sport: e.sport, companyId: companyRef.id })
  console.log(`  ${e.orgName} -> ${email}`)
}

// ─── Workers ──────────────────────────────────────────────────────────────────

console.log('--- Creating 18 worker accounts')
const WORKER_COUNT = 18
const workers = []
for (let i = 0; i < WORKER_COUNT; i++) {
  const first  = pick(FIRST_NAMES, i)
  const last   = pick(LAST_NAMES, i + 7) // offset so first/last don't repeat in lockstep
  const town   = pick(TOWNS, i)
  const sport  = pick(SPORTS, i)
  const role   = pick(ALL_ROLES, i * 3 + 1)
  const coords = jitter(town)
  const avgRating    = Math.round(randBetween(4.2, 5.0) * 10) / 10
  const ratingCount  = randInt(3, 42)
  const completedJobsCount = randInt(0, 60)
  // Roughly half not_started, a few pending, the rest clear -- "some verified and some not started"
  const bgStatus = i % 5 === 0 ? 'pending' : i % 2 === 0 ? 'clear' : 'not_started'

  const email = `demo-worker-${i + 1}-${RUN_TAG}@staffthegame.demo`
  const uid = await createAccount(email, PASSWORD, {
    email, name: `${first} ${last}`, firstName: first, lastName: last, role: 'worker',
    phone: `+1413555${String(1000 + i).padStart(4, '0')}`,
    street: `${100 + i} Main St`, city: town.city, state: town.state, zipCode: town.zip,
    coordinates: coords,
    educationLevel: i % 3 === 0 ? 'college' : i % 3 === 1 ? 'high_school' : 'other',
    schoolName: i % 3 === 0 ? 'UMass Amherst' : '',
    sports: [{ sportId: sport, experienceLevel: pick(EXPERIENCE_LEVELS, i) }],
    primaryRole: role,
    bio: `${pick(EXPERIENCE_LEVELS, i).replace('_', ' ')} ${sport} ${role.toLowerCase()} based in ${town.city}, MA.`,
    ratingStats: { average: avgRating, count: ratingCount },
    completedJobsCount,
    backgroundCheck: { status: bgStatus, updatedAt: serverTimestamp() },
    badges: [],
    isDemo: true,
  })
  workers.push({ uid, email, name: `${first} ${last}`, role, sport })
}
console.log(`  created ${workers.length} workers`)

// ─── Jobs ─────────────────────────────────────────────────────────────────────

console.log('--- Creating job postings')
const pv  = employerIds[0] // Pioneer Valley Baseball League
const bsa = employerIds[1] // Berkshire Softball Alliance
const springfield = TOWNS[0]

// Creating the 18 worker accounts above switched the client SDK's active session to
// the last worker created — jobs must be created while signed in as their employer.
await signInWithEmailAndPassword(auth, pv.email, PASSWORD)

async function createJob(employer, data) {
  const ref = await addDoc(collection(db, 'jobs'), {
    employerId: employer.uid, companyId: employer.companyId, companyName: employer.orgName,
    status: 'active', applicationCount: 0,
    urgent: false, boostExpiry: null, rapidFill: false, rapidFillActivatedAt: null,
    requirements: '', questions: [], checklistTemplate: null,
    isDemo: true,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    ...data,
  })
  return ref.id
}

// 1. Regular job
await createJob(pv, {
  title: 'Assistant Coach', sport: 'baseball', jobType: 'part-time', category: 'coaching',
  description: 'Support the head coach with practices and game-day duties for our 12U travel team.',
  location: `${springfield.city}, ${springfield.state}`, zipCode: springfield.zip, coordinates: springfield,
  salaryMin: 20, salaryMax: 25, salaryPeriod: 'hour', requiresCORI: true, roleType: 'ongoing',
})

// 2. Boosted job
await createJob(pv, {
  title: 'Umpire', sport: 'baseball', jobType: 'gig', category: 'officiating',
  description: 'Need a certified umpire for weekend league games this season.',
  location: `${springfield.city}, ${springfield.state}`, zipCode: springfield.zip, coordinates: springfield,
  salaryMin: 45, salaryMax: 45, salaryPeriod: 'game', requiresCORI: false, roleType: 'ongoing',
  urgent: true, boostExpiry: Timestamp.fromMillis(Date.now() + 48 * 60 * 60 * 1000),
})

// 3. Rapid Fill job — several seeded workers share sport=baseball/role=Scoreboard Operator
//    near Springfield so toggling this on in the live demo shows a real non-zero count.
await createJob(pv, {
  title: 'Scoreboard Operator', sport: 'baseball', jobType: 'gig', category: 'operations',
  description: 'Last-minute opening for tonight\'s doubleheader — need someone who knows the booth.',
  location: `${springfield.city}, ${springfield.state}`, zipCode: springfield.zip, coordinates: springfield,
  salaryMin: 25, salaryMax: 25, salaryPeriod: 'hour', requiresCORI: false, roleType: 'event',
  rapidFill: true, rapidFillActivatedAt: serverTimestamp(),
})

await signInWithEmailAndPassword(auth, bsa.email, PASSWORD)

// 4. Regular job (second employer)
await createJob(bsa, {
  title: 'Pitching Coach', sport: 'softball', jobType: 'part-time', category: 'coaching',
  description: 'Work with our 14U pitching staff twice a week through the spring season.',
  location: `${TOWNS[5].city}, ${TOWNS[5].state}`, zipCode: TOWNS[5].zip, coordinates: TOWNS[5],
  salaryMin: 30, salaryMax: 35, salaryPeriod: 'hour', requiresCORI: true, roleType: 'ongoing',
})

// 5. Event job with the Event Checklist enabled
await createJob(bsa, {
  title: 'Tournament Director', sport: 'softball', jobType: 'gig', category: 'operations',
  description: 'Run day-of operations for our 3-day Berkshire Invitational tournament.',
  location: `${TOWNS[5].city}, ${TOWNS[5].state}`, zipCode: TOWNS[5].zip, coordinates: TOWNS[5],
  salaryMin: 400, salaryMax: 400, salaryPeriod: 'flat', requiresCORI: false, roleType: 'event',
  checklistTemplate: {
    tasks: [
      { taskId: 't1', label: 'Arrive on time / check in with site contact', requiresPhoto: false, order: 0 },
      { taskId: 't2', label: 'Setup and equipment ready', requiresPhoto: false, order: 1 },
      { taskId: 't3', label: 'All participants checked in', requiresPhoto: false, order: 2 },
      { taskId: 't4', label: 'Confirm wrap-up / cleanup complete', requiresPhoto: false, order: 3 },
    ],
    notifyNumbers: ['+14135551234'],
    createdBy: bsa.uid,
  },
})

console.log('  created 5 job postings (regular x2, boosted, rapid fill, event w/ checklist)')

// ─── Applicants + Rapid Fill queue ────────────────────────────────────────────
// Needs job ids, so re-fetch what we just created rather than threading ids through
// the createJob() calls above.

console.log('--- Adding applicants and a Rapid Fill queue')
await signInWithEmailAndPassword(auth, pv.email, PASSWORD)
const allDemoJobsSnap = await getDocs(query(collection(db, 'jobs'), where('isDemo', '==', true)))
const allDemoJobs = allDemoJobsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

const pendingWorkers = workers.filter((w, i) => (i % 5 === 0))
const clearWorkers   = workers.filter((w, i) => (i % 5 !== 0 && i % 2 === 0))
const otherWorkers   = workers.filter((w, i) => (i % 5 !== 0 && i % 2 !== 0))
let pendingPtr = 0, clearPtr = 0, otherPtr = 0
function pickApplicants(count) {
  const chosen = []
  if (pendingWorkers.length) chosen.push(pendingWorkers[pendingPtr++ % pendingWorkers.length])
  if (clearWorkers.length)   chosen.push(clearWorkers[clearPtr++ % clearWorkers.length])
  while (chosen.length < count && otherWorkers.length) {
    const w = otherWorkers[otherPtr++ % otherWorkers.length]
    if (!chosen.some((c) => c.uid === w.uid)) chosen.push(w)
    if (otherPtr > otherWorkers.length * 2) break
  }
  return chosen.slice(0, count)
}

const applicantJobs = allDemoJobs.filter((j) => !j.rapidFill)
const applicationsByWorker = new Map() // uid -> [job]
for (const job of applicantJobs) {
  for (const w of pickApplicants(4)) {
    if (!applicationsByWorker.has(w.uid)) applicationsByWorker.set(w.uid, [])
    applicationsByWorker.get(w.uid).push(job)
  }
}
for (const [uid, jobsForWorker] of applicationsByWorker.entries()) {
  const worker = workers.find((w) => w.uid === uid)
  await signInWithEmailAndPassword(auth, worker.email, PASSWORD)
  for (const job of jobsForWorker) {
    await addDoc(collection(db, 'applications'), {
      jobId: job.id, userId: uid, answers: [], status: 'pending', priority: false, notes: '',
      isDemo: true, appliedAt: serverTimestamp(), updatedAt: serverTimestamp(),
    })
  }
}
console.log(`  added applicants (mix of background-check statuses) across ${applicantJobs.length} job(s)`)

const rapidFillJob = allDemoJobs.find((j) => j.rapidFill)
if (rapidFillJob) {
  for (const w of pickApplicants(3)) {
    await signInWithEmailAndPassword(auth, w.email, PASSWORD)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    await addDoc(collection(db, 'rapidFillHolds'), {
      jobId: rapidFillJob.id, workerId: w.uid, workerName: w.name, workerEmail: w.email,
      status: 'pending', isDemo: true, createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt), notifiedAt: null,
    })
  }
  console.log(`  queued 3 workers in the Rapid Fill queue on "${rapidFillJob.title}"`)
}

// ─── Verify one employer + one worker can log out and back in ────────────────

const demoEmployer = employerIds[0]
const demoWorker   = workers[0]

console.log('--- Verifying demo employer can log out and back in')
await signOut(auth)
await signInWithEmailAndPassword(auth, demoEmployer.email, PASSWORD)
console.log('  OK —', demoEmployer.email)
await signOut(auth)

console.log('--- Verifying demo worker can log out and back in')
await signInWithEmailAndPassword(auth, demoWorker.email, PASSWORD)
console.log('  OK —', demoWorker.email)
await signOut(auth)

console.log('\n=== Demo login credentials ===')
console.log('Employer:', demoEmployer.email, '/', PASSWORD, `(${demoEmployer.orgName})`)
console.log('Worker:  ', demoWorker.email, '/', PASSWORD, `(${demoWorker.name}, ${demoWorker.role})`)
console.log('===============================\n')

process.exit(0)
