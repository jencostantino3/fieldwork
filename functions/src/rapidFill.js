const v1    = require('firebase-functions/v1')
const admin = require('firebase-admin')

if (!admin.apps.length) admin.initializeApp()

// Runs every 5 minutes. Finds pending holds whose expiresAt has passed and marks them expired.
exports.expireRapidFillHolds = v1.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    const db  = admin.firestore()
    const now = admin.firestore.Timestamp.now()

    const snap = await db.collection('rapidFillHolds')
      .where('status', '==', 'pending')
      .where('expiresAt', '<=', now)
      .get()

    if (snap.empty) return null

    const batch = db.batch()
    snap.docs.forEach((d) => {
      batch.update(d.ref, {
        status:     'expired',
        notifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    })
    await batch.commit()
    console.log(`[expireRapidFillHolds] expired ${snap.size} hold(s)`)
    return null
  })
