import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export const BACKGROUND_CHECK_STATUS = {
  NOT_STARTED: 'not_started',
  SUBMITTED:   'submitted',
  PENDING:     'pending',
  CLEAR:       'clear',
}

// Demo — Checkr integration pending. Simulates the Start -> Submitted -> Pending
// hand-off a real background check provider would do asynchronously; only an
// isAdmin account can move a check to Clear (see markBackgroundCheckClear below
// and the users/{uid} rules in firestore.rules).
export async function startBackgroundCheck(uid) {
  await setDoc(doc(db, 'users', uid), {
    backgroundCheck: { status: BACKGROUND_CHECK_STATUS.SUBMITTED, updatedAt: serverTimestamp() },
  }, { merge: true })

  // TODO: real Checkr API call here — kick off an actual invitation/report and
  // let their webhook drive the status transitions instead of this timer.
  await new Promise((resolve) => setTimeout(resolve, 2000))

  await setDoc(doc(db, 'users', uid), {
    backgroundCheck: { status: BACKGROUND_CHECK_STATUS.PENDING, updatedAt: serverTimestamp() },
  }, { merge: true })
}

export async function markBackgroundCheckClear(targetUid) {
  return updateDoc(doc(db, 'users', targetUid), {
    backgroundCheck: { status: BACKGROUND_CHECK_STATUS.CLEAR, updatedAt: serverTimestamp() },
  })
}
