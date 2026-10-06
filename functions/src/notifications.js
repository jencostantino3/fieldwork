const v1             = require('firebase-functions/v1')
const admin          = require('firebase-admin')
const ROLE_CATEGORIES = require('./roleCategories')

if (!admin.apps.length) admin.initializeApp()

const DEMO_MODE = process.env.DEMO_MODE === 'true'
const EARTH_RADIUS_MILES = 3958.8
const RAPID_FILL_RADIUS_MILES = 50

function toRad(deg) {
  return deg * (Math.PI / 180)
}

function milesBetween(a, b) {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sinLat = Math.sin(dLat / 2) ** 2
  const sinLng = Math.sin(dLng / 2) ** 2
  const h = sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

// Single choke point for every outbound text in the app. In demo mode this never
// touches Twilio — it writes a doc the client can render as an on-screen phone
// preview instead. isDemo: true so the demo cleanup script can remove them.
async function dispatchMessage({ to, body, type, jobId }) {
  if (DEMO_MODE) {
    await admin.firestore().collection('demoMessages').add({
      to:        to || null,
      body,
      type,
      jobId:     jobId || null,
      isDemo:    true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    return
  }

  // TODO: real Twilio send here — functions/src/notifications.js
  // const twilio = require('twilio')
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  // await client.messages.create({ body, from: process.env.TWILIO_PHONE_NUMBER, to })
  console.warn('[notifications] DEMO_MODE is off but Twilio sending is not wired up yet — message dropped:', { to, type })
}

function findRoleCategory(roleCategories, primaryRole) {
  return roleCategories.find((c) => c.roles.includes(primaryRole))
}

// Workers "qualify" for a Rapid Fill alert if they play the job's sport, their
// seeded primary role maps to the job's role category, and they're within
// RAPID_FILL_RADIUS_MILES of the job. Matches the fields the worker profile and
// job-posting forms actually collect (src/pages/WorkerProfile.jsx, src/pages/PostJob.jsx).
async function findQualifiedWorkers(job, roleCategories) {
  const snap = await admin.firestore().collection('users').where('role', '==', 'worker').get()

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((worker) => {
      const playsSport = (worker.sports || []).some((s) => s.sportId === job.sport)
      if (!playsSport) return false

      const category = worker.primaryRole ? findRoleCategory(roleCategories, worker.primaryRole) : null
      if (!category || category.categoryValue !== job.category) return false

      if (!job.coordinates || !worker.coordinates) return false
      return milesBetween(job.coordinates, worker.coordinates) <= RAPID_FILL_RADIUS_MILES
    })
}

async function notifyQualifiedWorkers(job, workers) {
  const body = `STAFF THE GAME: Rapid Fill — ${job.title} needed at ${job.companyName}. View job.`
  await Promise.all(
    workers.map((w) => dispatchMessage({ to: w.phone, body, type: 'rapid_fill', jobId: job.id }))
  )
  return workers.length
}

// The two notification entry points the rest of the app calls into.
async function sendChecklistUpdate({ jobTitle, jobId, workerName, completedLabels, notifyNumbers }) {
  const taskList = completedLabels.join(', ')
  const body = `STAFF THE GAME: ${workerName} completed ${completedLabels.length} task(s) for "${jobTitle}": ${taskList}.`
  await Promise.all(
    (notifyNumbers || []).map((to) => dispatchMessage({ to, body, type: 'checklist_update', jobId }))
  )
}

// Callable — employer flags a job Rapid Fill, we find real qualified workers,
// notify them (demo or real), and return the count for "X qualified workers notified."
const sendRapidFillAlert = v1.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new v1.https.HttpsError('unauthenticated', 'Must be signed in.')
  }

  const { jobId } = data
  if (!jobId) throw new v1.https.HttpsError('invalid-argument', 'jobId is required.')

  const jobSnap = await admin.firestore().collection('jobs').doc(jobId).get()
  if (!jobSnap.exists) throw new v1.https.HttpsError('not-found', 'Job not found.')
  const job = { id: jobSnap.id, ...jobSnap.data() }

  if (job.employerId !== context.auth.uid) {
    throw new v1.https.HttpsError('permission-denied', 'Not your job posting.')
  }

  const workers = await findQualifiedWorkers(job, ROLE_CATEGORIES)
  const notifiedCount = await notifyQualifiedWorkers(job, workers)

  return { notifiedCount }
})

module.exports = { sendRapidFillAlert, sendChecklistUpdate }
