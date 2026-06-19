/**
 * Firebase Cloud Function — Stripe Boost Checkout
 *
 * Deploy with: firebase deploy --only functions
 *
 * Install deps in /functions:
 *   npm install firebase-functions firebase-admin stripe
 */

const functions = require('firebase-functions')
const admin     = require('firebase-admin')
const Stripe    = require('stripe')

const stripe = new Stripe(functions.config().stripe.secret_key, { apiVersion: '2023-10-16' })

/**
 * Creates a Stripe Checkout Session for the Urgent Boost feature.
 * Called from the client via httpsCallable.
 */
exports.createBoostCheckout = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.')
  }

  const { jobId, jobTitle, returnUrl } = data

  const session = await stripe.checkout.sessions.create({
    mode:    'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency:     'usd',
          unit_amount:  999,        // $9.99
          product_data: { name: `FieldWork Urgent Boost — ${jobTitle}` },
        },
        quantity: 1,
      },
    ],
    metadata: {
      jobId,
      employerId: context.auth.uid,
    },
    success_url: `${returnUrl}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  returnUrl,
  })

  return { sessionId: session.id }
})

/**
 * Stripe webhook — listen for successful payments and activate the boost.
 * Set webhook endpoint in Stripe dashboard to:
 *   https://<region>-<project>.cloudfunctions.net/stripeWebhook
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig     = req.headers['stripe-signature']
  const secret  = functions.config().stripe.webhook_secret

  let event
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, secret)
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { jobId, employerId } = session.metadata

    await admin.firestore().collection('boosts').add({
      jobId,
      employerId,
      stripeSessionId: session.id,
      activatedAt:     admin.firestore.FieldValue.serverTimestamp(),
      expiresAfterHrs: 48,
    })

    await admin.firestore().doc(`jobs/${jobId}`).update({
      urgent:      true,
      boostExpiry: admin.firestore.Timestamp.fromMillis(Date.now() + 48 * 60 * 60 * 1000),
      updatedAt:   admin.firestore.FieldValue.serverTimestamp(),
    })
  }

  res.json({ received: true })
})
