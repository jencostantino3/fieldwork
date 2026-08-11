const v1    = require('firebase-functions/v1')
const admin = require('firebase-admin')

if (!admin.apps.length) admin.initializeApp()

exports.onChecklistTaskComplete = v1.firestore
  .document('checklistResponses/{responseId}')
  .onUpdate(async (change) => {
    const before = change.before.data()
    const after  = change.after.data()

    const newlyCompleted = after.tasks.filter(
      (t, i) => t.completed && !before.tasks[i]?.completed
    )
    if (!newlyCompleted.length) return null

    const jobSnap = await admin.firestore().collection('jobs').doc(after.jobId).get()
    if (!jobSnap.exists) return null

    const { title, checklistTemplate } = jobSnap.data()
    const notifyNumbers = checklistTemplate?.notifyNumbers ?? []

    // TODO: send Twilio SMS when configured
    console.log(
      `[checklist] "${title}" — ${newlyCompleted.length} task(s) completed:`,
      newlyCompleted.map((t) => t.label),
      '→ notify:',
      notifyNumbers
    )

    return null
  })
