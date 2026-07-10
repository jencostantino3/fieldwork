import { httpsCallable } from 'firebase/functions'
import { functions, auth } from '@/firebase'
import { STRIPE_LINKS, STRIPE_PRICES } from '@/utils/constants'

function callFn(name, payload) {
  if (!functions) throw new Error('Firebase is not configured.')
  return httpsCallable(functions, name)(payload).then((r) => r.data)
}

const PRICE_TO_LINK = {
  [STRIPE_PRICES.EMP_PRO_MONTHLY]:    STRIPE_LINKS.EMP_PRO_MONTHLY,
  [STRIPE_PRICES.EMP_PRO_YEARLY]:     STRIPE_LINKS.EMP_PRO_YEARLY,
  [STRIPE_PRICES.WORKER_PRO_MONTHLY]: STRIPE_LINKS.WORKER_PRO_MONTHLY,
}

export async function startSubscriptionCheckout(priceId, planName) {
  const baseUrl = PRICE_TO_LINK[priceId]
  if (!baseUrl) throw new Error('No payment link configured for this plan.')

  const user = auth?.currentUser
  if (!user) throw new Error('Must be signed in.')

  const clientRef = encodeURIComponent(`${user.uid}:${planName}`)
  const email     = encodeURIComponent(user.email || '')
  window.location.href = `${baseUrl}?client_reference_id=${clientRef}&prefilled_email=${email}`
}

export async function startBoostCheckout(jobId, jobTitle) {
  const { url } = await callFn('createBoostCheckout', {
    jobId,
    jobTitle,
    returnUrl: window.location.origin,
  })
  window.location.href = url
}

export async function openBillingPortal() {
  const { url } = await callFn('createBillingPortal', {
    returnUrl: window.location.origin + '/profile',
  })
  window.location.href = url
}
