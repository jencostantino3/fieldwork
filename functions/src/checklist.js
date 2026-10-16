const v1            = require('firebase-functions/v1')
const admin         = require('firebase-admin')
const notifications = require('./notifications')

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

    const { title, checklistTemplate, employerId } = jobSnap.data()
    const notifyNumbers = checklistTemplate?.notifyNumbers ?? []

    await notifications.sendChecklistUpdate({
      jobTitle:        title,
      jobId:           after.jobId,
      workerName:      after.workerName || 'A worker',
      completedLabels: newlyCompleted.map((t) => t.label),
      notifyNumbers,
      employerId,
    })

    return null
  })
