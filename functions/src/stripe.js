const v1       = require('firebase-functions/v1')
const { onRequest, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret }          = require('firebase-functions/params')
const admin  = require('firebase-admin')
const Stripe = require('stripe')
const https  = require('https')

if (!admin.apps.length) admin.initializeApp()

const stripeSecretKey     = defineSecret('STRIPE_SECRET_KEY')
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET')

// ─── Helpers ───────────────────────────────────────────────────────────────

function stripeClient(key) {
  return new Stripe(key, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createNodeHttpClient(new https.Agent({ family: 4 })),
    maxNetworkRetries: 0,
  })
}

async function getOrCreateCustomer(s, uid, email) {
  const snap = await admin.firestore().doc(`users/${uid}`).get()
  const existing = snap.data()?.stripeCustomerId
  if (existing) return existing

  const customer = await s.customers.create({ email, metadata: { uid } })
  await admin.firestore().doc(`users/${uid}`).set(
    { stripeCustomerId: customer.id },
    { merge: true }
  )
  return customer.id
}

// ─── Subscription Checkout (v1 — handles CORS automatically) ──────────────

exports.createSubscriptionCheckout = v1
  .runWith({ secrets: ['STRIPE_SECRET_KEY'] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new v1.https.HttpsError('unauthenticated', 'Must be signed in.')
    }

    const { priceId, planName, origin } = data
    if (!priceId)  throw new v1.https.HttpsError('invalid-argument', 'priceId is required.')
    if (!planName) throw new v1.https.HttpsError('invalid-argument', 'planName is required.')

    try {
      const s = stripeClient(process.env.STRIPE_SECRET_KEY)
      const uid        = context.auth.uid
      const email      = context.auth.token.email

      const customerId = await getOrCreateCustomer(s, uid, email)
      const session    = await s.checkout.sessions.create({
        customer:             customerId,
        mode:                 'subscription',
        payment_method_types: ['card'],
        line_items:           [{ price: priceId, quantity: 1 }],
        subscription_data:    { metadata: { uid, plan: planName } },
        success_url: `${origin}/billing-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:  `${origin}/pricing`,
      })

      console.log('[createSubscriptionCheckout] session:', session.id)
      return { url: session.url }
    } catch (err) {
      console.error('[createSubscriptionCheckout] error type:', err.constructor?.name, 'message:', err.message)
      throw new v1.https.HttpsError('internal', err.message)
    }
  })

// ─── Billing Portal (v1) ───────────────────────────────────────────────────

exports.createBillingPortal = v1
  .runWith({ secrets: ['STRIPE_SECRET_KEY'] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new v1.https.HttpsError('unauthenticated', 'Must be signed in.')
    }

    try {
      const s          = stripeClient(process.env.STRIPE_SECRET_KEY)
      const uid        = context.auth.uid
      const { returnUrl } = data

      const snap       = await admin.firestore().doc(`users/${uid}`).get()
      const customerId = snap.data()?.stripeCustomerId

      if (!customerId) {
        throw new v1.https.HttpsError('not-found', 'No billing account found — subscribe first.')
      }

      const session = await s.billingPortal.sessions.create({
        customer:   customerId,
        return_url: returnUrl,
      })

      return { url: session.url }
    } catch (err) {
      console.error('[createBillingPortal] error:', err.message)
      throw new v1.https.HttpsError('internal', err.message)
    }
  })

// ─── Boost Checkout (v1) ──────────────────────────────────────────────────

exports.createBoostCheckout = v1
  .runWith({ secrets: ['STRIPE_SECRET_KEY'] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new v1.https.HttpsError('unauthenticated', 'Must be signed in.')
    }

    const { jobId, jobTitle, returnUrl } = data
    if (!jobId)    throw new v1.https.HttpsError('invalid-argument', 'jobId is required.')
    if (!jobTitle) throw new v1.https.HttpsError('invalid-argument', 'jobTitle is required.')

    try {
      const s = stripeClient(process.env.STRIPE_SECRET_KEY)

      const session = await s.checkout.sessions.create({
        mode:                 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency:     'usd',
            unit_amount:  2000,
            product_data: {
              name:        `FieldWork Urgent Boost — ${jobTitle}`,
              description: 'Pins your listing to the top for 48 hours and notifies matching workers.',
            },
          },
          quantity: 1,
        }],
        metadata:    { type: 'boost', jobId, employerId: context.auth.uid },
        success_url: `${returnUrl ?? 'http://localhost:3003'}/billing-success?boost=1&job=${jobId}`,
        cancel_url:  `${returnUrl ?? 'http://localhost:3003'}/dashboard`,
      })

      return { url: session.url }
    } catch (err) {
      console.error('[createBoostCheckout] error:', err.message)
      throw new v1.https.HttpsError('internal', err.message)
    }
  })

// ─── Stripe Webhook (v2 onRequest) ────────────────────────────────────────

exports.stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret], invoker: 'public' },
  async (req, res) => {
    const sig = req.headers['stripe-signature']
    const rawBody = req.rawBody

    // Always log upfront so we can diagnose without reaching the try-catch
    console.log('[webhook] rawBody present:', !!rawBody, '| type:', typeof rawBody, '| length:', rawBody?.length ?? 'N/A')
    console.log('[webhook] sig present:', !!sig)

    let webhookSecret
    try { webhookSecret = stripeWebhookSecret.value() } catch (e) {
      console.error('[webhook] failed to read STRIPE_WEBHOOK_SECRET:', e.message)
    }
    console.log('[webhook] webhookSecret defined:', !!webhookSecret, '| length:', webhookSecret?.length ?? 0)

    let event
    try {
      if (!rawBody) {
        throw new Error('req.rawBody is undefined — body not buffered')
      }
      if (webhookSecret && sig) {
        const stripe = new Stripe(stripeSecretKey.value(), { apiVersion: '2023-10-16' })
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
      } else {
        console.warn('[webhook] skipping signature check — webhookSecret:', !!webhookSecret, 'sig:', !!sig)
        event = JSON.parse(rawBody.toString())
      }
    } catch (err) {
      console.error('[webhook] signature check failed:', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    const db = admin.firestore()
    console.log('[webhook] event type:', event.type)

    try {
      switch (event.type) {

        case 'checkout.session.completed': {
          const session = event.data.object

          console.log('[webhook] session mode:', session.mode, 'client_reference_id:', session.client_reference_id)
          if (session.mode === 'subscription') {
            // Payment link checkout — client_reference_id = "uid:planName"
            const ref = session.client_reference_id || ''
            const colonIdx = ref.indexOf(':')
            const uid  = colonIdx > 0 ? ref.slice(0, colonIdx) : ref
            const plan = colonIdx > 0 ? ref.slice(colonIdx + 1) : 'employer_pro'
            console.log('[webhook] parsed uid:', uid, 'plan:', plan)
            if (!uid) break
            await db.doc(`users/${uid}`).set({
              plan,
              subscriptionId:   session.subscription,
              subscriptionStatus: 'active',
              stripeCustomerId: session.customer,
            }, { merge: true })
          } else if (session.mode === 'payment' && session.metadata?.type === 'boost') {
            const { jobId, employerId } = session.metadata
            await Promise.all([
              db.collection('boosts').add({
                jobId, employerId,
                stripeSessionId: session.id,
                activatedAt:     admin.firestore.FieldValue.serverTimestamp(),
                expiresAfterHrs: 48,
              }),
              db.doc(`jobs/${jobId}`).update({
                urgent:      true,
                boostExpiry: admin.firestore.Timestamp.fromMillis(Date.now() + 48 * 60 * 60 * 1000),
                updatedAt:   admin.firestore.FieldValue.serverTimestamp(),
              }),
            ])
          }
          break
        }

        case 'customer.subscription.updated': {
          const sub   = event.data.object
          const query = await db.collection('users').where('subscriptionId', '==', sub.id).limit(1).get()
          if (query.empty) break
          await query.docs[0].ref.set({
            subscriptionStatus: sub.status,
            currentPeriodEnd:   admin.firestore.Timestamp.fromMillis(sub.current_period_end * 1000),
          }, { merge: true })
          break
        }

        case 'customer.subscription.deleted': {
          const sub   = event.data.object
          const query = await db.collection('users').where('subscriptionId', '==', sub.id).limit(1).get()
          if (query.empty) break
          await query.docs[0].ref.set({
            plan:               'free',
            subscriptionStatus: 'canceled',
            subscriptionId:     admin.firestore.FieldValue.delete(),
            currentPeriodEnd:   admin.firestore.FieldValue.delete(),
          }, { merge: true })
          break
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object
          if (!invoice.customer) break
          const query = await db.collection('users').where('stripeCustomerId', '==', invoice.customer).limit(1).get()
          if (!query.empty) {
            await query.docs[0].ref.set({ subscriptionStatus: 'past_due' }, { merge: true })
          }
          break
        }
      }
    } catch (err) {
      console.error(`[webhook] error handling ${event.type}:`, err)
      return res.status(500).send('Internal error processing webhook.')
    }

    res.json({ received: true })
  }
)
