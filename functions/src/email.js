const v1    = require('firebase-functions/v1')
const admin = require('firebase-admin')
const sgMail = require('@sendgrid/mail')

if (!admin.apps.length) admin.initializeApp()

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@staffthegame.com'
const APP_URL    = process.env.APP_URL || 'https://sports-jobs-e9c23.web.app'

function initSendGrid() {
  const key = process.env.SENDGRID_API_KEY
  if (!key) throw new Error('SENDGRID_API_KEY not set')
  sgMail.setApiKey(key)
}

function brandedEmail({ to, subject, heading, body, ctaText, ctaUrl }) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0a1628;padding:24px 32px;">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.3px;">
              Staff the Game
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0a1628;line-height:1.3;">
              ${heading}
            </h1>
            <div style="font-size:15px;color:#374151;line-height:1.7;">
              ${body}
            </div>
            ${ctaText && ctaUrl ? `
            <div style="margin-top:28px;">
              <a href="${ctaUrl}"
                 style="display:inline-block;background:#1B4FE4;color:#ffffff;font-size:14px;font-weight:600;
                        padding:12px 24px;border-radius:10px;text-decoration:none;">
                ${ctaText}
              </a>
            </div>` : ''}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              You're receiving this because you have an account on
              <a href="${APP_URL}" style="color:#1B4FE4;text-decoration:none;">Staff the Game</a>.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { to, from: FROM_EMAIL, subject, html }
}

// ── Trigger 1: New application submitted → notify employer ─────────────────

exports.onApplicationCreated = v1.firestore
  .document('applications/{appId}')
  .onCreate(async (snap) => {
    try {
      initSendGrid()
      const app = snap.data()

      const [jobSnap, workerSnap] = await Promise.all([
        admin.firestore().collection('jobs').doc(app.jobId).get(),
        admin.firestore().collection('users').doc(app.userId).get(),
      ])

      if (!jobSnap.exists) return null
      const job    = jobSnap.data()
      const worker = workerSnap.exists ? workerSnap.data() : {}

      const employerSnap = await admin.firestore().collection('users').doc(job.employerId).get()
      if (!employerSnap.exists) return null
      const employer = employerSnap.data()
      if (!employer.email) return null

      const workerName = worker.name || worker.email || 'A worker'

      await sgMail.send(brandedEmail({
        to:      employer.email,
        subject: `New applicant for "${job.title}"`,
        heading: `You have a new applicant!`,
        body: `
          <p><strong>${workerName}</strong> just applied for your <strong>${job.title}</strong> position.</p>
          <p>Log in to your dashboard to view their answers and update their application status.</p>
        `,
        ctaText: 'View Applicants',
        ctaUrl:  `${APP_URL}/dashboard`,
      }))

      console.log(`[email] Notified employer ${employer.email} of new applicant for "${job.title}"`)
    } catch (err) {
      console.error('[email] onApplicationCreated error:', err.message)
    }
    return null
  })

// ── Trigger 2: Application status changed → notify worker ──────────────────

const WORKER_STATUS_MESSAGES = {
  accepted: {
    heading: "Great news — you've been accepted!",
    body: (jobTitle, orgName) => `
      <p>Your application for <strong>${jobTitle}</strong>${orgName ? ` at <strong>${orgName}</strong>` : ''} has been <strong style="color:#16a34a;">accepted</strong>.</p>
      <p>The employer will be in touch via email to discuss next steps. Keep an eye on your inbox!</p>
    `,
  },
  rejected: {
    heading: 'An update on your application',
    body: (jobTitle, orgName) => `
      <p>Thank you for applying for <strong>${jobTitle}</strong>${orgName ? ` at <strong>${orgName}</strong>` : ''}.</p>
      <p>Unfortunately the employer has decided to move forward with other candidates at this time. Keep applying — more opportunities are posted every day.</p>
    `,
  },
  reviewed: {
    heading: 'Your application is under review',
    body: (jobTitle, orgName) => `
      <p>Good news — the employer has reviewed your application for <strong>${jobTitle}</strong>${orgName ? ` at <strong>${orgName}</strong>` : ''}.</p>
      <p>They're still evaluating candidates. We'll notify you if your status changes.</p>
    `,
  },
}

exports.onApplicationStatusChanged = v1.firestore
  .document('applications/{appId}')
  .onUpdate(async (change) => {
    try {
      const before = change.before.data()
      const after  = change.after.data()

      if (before.status === after.status) return null

      const template = WORKER_STATUS_MESSAGES[after.status]
      if (!template) return null

      initSendGrid()

      const [jobSnap, workerSnap] = await Promise.all([
        admin.firestore().collection('jobs').doc(after.jobId).get(),
        admin.firestore().collection('users').doc(after.userId).get(),
      ])

      if (!workerSnap.exists) return null
      const worker = workerSnap.data()
      if (!worker.email) return null

      const job    = jobSnap.exists ? jobSnap.data() : {}
      const title  = job.title    || 'the position'
      const org    = job.companyName || ''

      await sgMail.send(brandedEmail({
        to:      worker.email,
        subject: `Update on your application for "${title}"`,
        heading: template.heading,
        body:    template.body(title, org),
        ctaText: 'View My Applications',
        ctaUrl:  `${APP_URL}/profile`,
      }))

      console.log(`[email] Notified worker ${worker.email} — status changed to "${after.status}" for "${title}"`)
    } catch (err) {
      console.error('[email] onApplicationStatusChanged error:', err.message)
    }
    return null
  })
