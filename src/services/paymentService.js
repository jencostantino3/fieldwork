import { loadStripe } from '@stripe/stripe-js'
import { BOOST_PRICE_ID } from '@/utils/constants'

let stripePromise = null

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

/**
 * Redirects employer to Stripe Checkout for a boost purchase.
 * On success, Stripe redirects to /dashboard?boost_success=true&session_id={CHECKOUT_SESSION_ID}
 *
 * NOTE: In production this checkout session should be created server-side
 * via a Firebase Cloud Function to avoid exposing your secret key.
 * Wire up the Cloud Function in functions/src/stripe.js.
 */
export async function startBoostCheckout({ jobId, jobTitle, returnUrl }) {
  const stripe = await getStripe()

  // TODO: Replace with a call to your Cloud Function that creates the session
  // const { sessionId } = await createBoostCheckoutSession({ jobId, jobTitle })
  // const { error } = await stripe.redirectToCheckout({ sessionId })

  // Placeholder: shows what the Cloud Function would receive
  console.info('[paymentService] would redirect to Stripe for job:', jobId, jobTitle)
  alert(
    'Stripe Checkout integration requires a server-side Cloud Function.\n' +
    'See functions/src/stripe.js for the implementation stub.\n\n' +
    'Job: ' + jobTitle
  )
}

export { BOOST_PRICE_ID }
