import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Check, Zap, Sparkles, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { startSubscriptionCheckout } from '@/services/billingService'
import { STRIPE_PRICES, PLANS } from '@/utils/constants'
import Button from '@/components/common/Button'
import PlanBadge from '@/components/billing/PlanBadge'

const EMPLOYER_FEATURES = {
  free: [
    '1 active job post',
    'Basic applicant list',
    'Question-based applications',
    'Company profile page',
  ],
  pro: [
    'Unlimited job posts',
    'Applicant comparison dashboard',
    'View verified credential badges',
    'Priority support',
    'Everything in Free',
  ],
}

const WORKER_FEATURES = {
  free: [
    'Full job search & filters',
    'Unlimited applications',
    'Credential badge display',
    'Application status tracking',
  ],
  pro: [
    'Applications flagged "Priority" to employers',
    '24-hour early access to new postings',
    'Verified Pro badge on your profile',
    'Everything in Free',
  ],
}

function FeatureList({ items }) {
  return (
    <ul className="space-y-2.5 mt-6">
      {items.map((f) => (
        <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
          <Check className="w-4 h-4 text-field shrink-0 mt-0.5" />
          {f}
        </li>
      ))}
    </ul>
  )
}

function EmployerPlans({ plan }) {
  const [billing, setBilling] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  const isMonthly = billing === 'monthly'
  const priceId   = isMonthly ? STRIPE_PRICES.EMP_PRO_MONTHLY : STRIPE_PRICES.EMP_PRO_YEARLY

  async function handleUpgrade() {
    if (!user) { navigate('/register?intent=employer_pro'); return }
    setLoading(true)
    setError('')
    try {
      await startSubscriptionCheckout(priceId, 'employer_pro')
    } catch (e) {
      setError(e.message || 'Could not start checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Employer Plans</h2>
        <p className="text-gray-500 mt-1 text-sm">Post jobs and find the right people for your team</p>
        <div className="inline-flex items-center bg-gray-100 rounded-full p-1 mt-4">
          {['monthly', 'yearly'].map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
                billing === b ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {b === 'yearly' ? 'Yearly (save 17%)' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free tier */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-900 text-lg">Free</h3>
            {plan === PLANS.FREE && <PlanBadge plan={PLANS.FREE} />}
          </div>
          <div className="flex items-end gap-1 mt-2">
            <span className="text-3xl font-black text-gray-900">$0</span>
            <span className="text-gray-400 text-sm mb-1">/mo</span>
          </div>
          <FeatureList items={EMPLOYER_FEATURES.free} />
          <div className="mt-6">
            {plan === PLANS.FREE ? (
              <div className="w-full py-2 text-center text-sm text-gray-400 font-medium border border-gray-200 rounded-xl">
                Current Plan
              </div>
            ) : (
              <Button variant="secondary" fullWidth onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Pro tier */}
        <div className="bg-brand-navy text-white border border-brand-navy rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg">Pro</h3>
            {plan === PLANS.EMPLOYER_PRO && <PlanBadge plan={PLANS.EMPLOYER_PRO} />}
          </div>
          <div className="flex items-end gap-1 mt-2">
            <span className="text-3xl font-black">
              {isMonthly ? '$49' : '$490'}
            </span>
            <span className="text-brand-200 text-sm mb-1">
              /{isMonthly ? 'mo' : 'yr'}
            </span>
            {!isMonthly && (
              <span className="ml-2 text-xs font-semibold bg-field text-white px-2 py-0.5 rounded-full mb-1">
                2 months free
              </span>
            )}
          </div>
          <ul className="space-y-2.5 mt-6">
            {EMPLOYER_FEATURES.pro.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-brand-100">
                <Check className="w-4 h-4 text-field-400 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {plan === PLANS.EMPLOYER_PRO ? (
              <div className="w-full py-2 text-center text-sm font-medium bg-white/10 rounded-xl">
                Current Plan
              </div>
            ) : (
              <Button
                className="w-full bg-field hover:bg-field-700 text-white"
                loading={loading}
                onClick={handleUpgrade}
              >
                <Sparkles className="w-4 h-4" /> Upgrade to Pro
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Boost add-on */}
      <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-urgent flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Urgent Boost — $20 per job</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              Pin your listing to the top of search results for 48 hours and push instant notifications to all matching, verified workers nearby.
            </p>
            <p className="text-xs text-amber-700 mt-2 font-medium">Available on any plan. Add a boost from your employer dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function WorkerPlans({ plan }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  async function handleUpgrade() {
    if (!user) { navigate('/register?intent=worker_pro'); return }
    setLoading(true)
    setError('')
    try {
      await startSubscriptionCheckout(STRIPE_PRICES.WORKER_PRO_MONTHLY, 'worker_pro')
    } catch (e) {
      setError(e.message || 'Could not start checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Worker Plans</h2>
        <p className="text-gray-500 mt-1 text-sm">Find your next role in sports. Stand out to employers.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-900 text-lg">Free</h3>
            {plan === PLANS.FREE && <PlanBadge plan={PLANS.FREE} />}
          </div>
          <div className="flex items-end gap-1 mt-2">
            <span className="text-3xl font-black text-gray-900">$0</span>
            <span className="text-gray-400 text-sm mb-1">/mo</span>
          </div>
          <FeatureList items={WORKER_FEATURES.free} />
          <div className="mt-6">
            {plan === PLANS.FREE ? (
              <div className="w-full py-2 text-center text-sm text-gray-400 font-medium border border-gray-200 rounded-xl">
                Current Plan
              </div>
            ) : (
              <Button variant="secondary" fullWidth onClick={() => navigate('/jobs')}>
                Browse Jobs
              </Button>
            )}
          </div>
        </div>

        {/* Worker Pro */}
        <div className="bg-field text-white border border-field rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg">Worker Pro</h3>
            {plan === PLANS.WORKER_PRO && <PlanBadge plan={PLANS.WORKER_PRO} />}
          </div>
          <div className="flex items-end gap-1 mt-2">
            <span className="text-3xl font-black">$7.99</span>
            <span className="text-field-100 text-sm mb-1">/mo</span>
          </div>
          <ul className="space-y-2.5 mt-6">
            {WORKER_FEATURES.pro.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-field-50">
                <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {plan === PLANS.WORKER_PRO ? (
              <div className="w-full py-2 text-center text-sm font-medium bg-white/10 rounded-xl">
                Current Plan
              </div>
            ) : (
              <Button
                variant="white"
                fullWidth
                loading={loading}
                onClick={handleUpgrade}
              >
                <Sparkles className="w-4 h-4" /> Upgrade to Pro
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
    </div>
  )
}

export default function Pricing() {
  const [searchParams] = useSearchParams()
  const { profile } = useAuth()
  const defaultTab = searchParams.get('tab') === 'worker' ? 'worker' : 'employer'
  const [tab, setTab] = useState(defaultTab)

  const plan = profile?.plan ?? PLANS.FREE
  const role = profile?.role ?? null

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-gray-900">Simple, honest pricing</h1>
          <p className="text-gray-500">No hidden fees. Cancel anytime.</p>
        </div>

        {/* Tab toggle */}
        <div className="flex justify-center">
          <div className="inline-flex bg-white border border-gray-200 rounded-2xl p-1 shadow-sm">
            {['employer', 'worker'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  tab === t
                    ? 'bg-brand-navy text-white shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'employer' ? 'For Employers' : 'For Workers'}
              </button>
            ))}
          </div>
        </div>

        {tab === 'employer' ? (
          <EmployerPlans plan={role === 'employer' ? plan : PLANS.FREE} />
        ) : (
          <WorkerPlans plan={role === 'worker' ? plan : PLANS.FREE} />
        )}

        {/* FAQ note */}
        <p className="text-center text-xs text-gray-400">
          Subscriptions renew automatically. Cancel anytime from your profile. All prices in USD.
        </p>
      </div>
    </div>
  )
}
