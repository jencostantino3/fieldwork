import {
  collection, addDoc, getDocs, query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { boostJob } from './jobService'
import { BOOST_DURATION_HRS } from '@/utils/constants'

const BOOSTS = 'boosts'

/**
 * Called after successful Stripe payment to activate an urgent boost.
 * Records the boost event and marks the job as urgent.
 */
export async function activateBoost({ jobId, employerId, stripeSessionId }) {
  await addDoc(collection(db, BOOSTS), {
    jobId,
    employerId,
    stripeSessionId,
    activatedAt: serverTimestamp(),
    expiresAfterHrs: BOOST_DURATION_HRS,
  })
  return boostJob(jobId, BOOST_DURATION_HRS)
}

export async function getEmployerBoosts(employerId) {
  const q = query(collection(db, BOOSTS), where('employerId', '==', employerId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
