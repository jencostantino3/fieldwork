import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Check, X, Minus, Zap, Sparkles, Crown, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { startSubscriptionCheckout } from '@/services/billingService'
import { STRIPE_PRICES, PLANS } from '@/utils/constants'
import Button from '@/components/common/Button'
import PlanBadge from '@/components/billing/PlanBadge'

// ─── Feature data ────────────────────────────────────────────────────────────

const EMPLOYER_CARDS = {
  free: {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    features: [
      '1 active job post',
      'Question-based applications',
      'Basic applicant list',
      'Company profile page',
    ],
  },
  pro: {
    name: 'Pro',
    price: { monthly: 49, yearly: 490 },
    features: [
      'Unlimited job posts',
      'Applicant comparison dashboard',
      'Verified credential badges',
      'Priority support',
      'Everything in Free',
    ],
  },
  elite: {
    name: 'Elite',
    price: { monthly: 98, yearly: 980 },
    features: [
      'Custom event checklists',
      'Photo-verified task completion',
      'Live event-day status view',
      'Automated text alerts',
      'Everything in Pro',
    ],
  },
}

const COMPARISON_ROWS = [
  { label: 'Active job posts',               free: '1',  pro: true,  elite: true  },
  { label: 'Question-based applications',    free: true, pro: true,  elite: true  },
  { label: 'Company profile page',           free: true, pro: true,  elite: true  },
  { label: 'Basic applicant list',           free: true, pro: true,  elite: true  },
  { label: 'Applicant comparison dashboard', free: false, pro: true, elite: true  },
  { label: 'Verified credential badges',     free: false, pro: true, elite: true  },
  { label: 'Priority support',               free: false, pro: true, elite: true  },
  { label: 'Urgent Boost add-on',            free: true, pro: true,  elite: true  },
  { label: 'Custom event checklists',        free: false, pro: false, elite: true },
  { label: 'Photo-verified task completion', free: false, pro: false, elite: true },
  { label: 'Live event-day status view',     free: false, pro: false, elite: true },
  { label: 'Automated text alerts',          free: false, pro: false, elite: true },
]

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

const WORKER_COMPARISON_ROWS = [
  { label: 'Full job search & filters',               free: true,  pro: true  },
  { label: 'Unlimited applications',                  free: true,  pro: true  },
  { label: 'Credential badge display',                free: true,  pro: true  },
  { label: 'Application status tracking',             free: true,  pro: true  },
  { label: 'Applications flagged "Priority"',         free: false, pro: true  },
  { label: '24-hour early access to new postings',    free: false, pro: true  },
  { label: 'Verified Pro badge on profile',           free: false, pro: true  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Cell({ value }) {
  if (value === true)  return <Check className="w-4 h-4 text-energyGreen mx-auto" />
  if (value === false) return <Minus className="w-4 h-4 text-gray-300 mx-auto" />
  return <span className="text-xs font-semibold text-gray-700">{value}</span>
}

function FeatureList({ items, dark = false }) {
  return (
    <ul className="space-y-2.5 mt-6">
      {items.map((f) => (
        <li key={f} className={`flex items-start gap-2.5 text-sm ${dark ? 'text-white/85' : 'text-gray-700'}`}>
          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${dark ? 'text-energyGreen-400' : 'text-energyGreen'}`} />
          {f}
        </li>
      ))}
    </ul>
  )
}

// ─── Employer plans ───────────────────────────────────────────────────────────

function EmployerPlans({ plan }) {
  const [billing, setBilling]   = useState('monthly')
  const [proLoading, setProLoad]     = useState(false)
  const [eliteLoading, setEliteLoad] = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  const isMonthly = billing === 'monthly'

  async function handleUpgrade(priceId, planName, setLoad) {
    if (!user) { navigate(`/register?intent=${planName}`); return }
    setLoad(true)
    setError('')
    try {
      await startSubscriptionCheckout(priceId, planName)
    } catch (e) {
      setError(e.message || 'Could not start checkout. Please try again.')
      setLoad(false)
    }
  }

  const proPriceId   = isMonthly ? STRIPE_PRICES.EMP_PRO_MONTHLY   : STRIPE_PRICES.EMP_PRO_YEARLY
  const elitePriceId = isMonthly ? STRIPE_PRICES.EMP_ELITE_MONTHLY : STRIPE_PRICES.EMP_ELITE_YEARLY

  return (
    <div className="space-y-8">
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

      {/* Cards — 3 tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">

        {/* Free */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-900 text-lg">{EMPLOYER_CARDS.free.name}</h3>
            {plan === PLANS.FREE && <PlanBadge plan={PLANS.FREE} />}
          </div>
          <div className="flex items-end gap-1 mt-2">
            <span className="text-3xl font-black text-gray-900">$0</span>
            <span className="text-gray-400 text-sm mb-1">/mo</span>
          </div>
          <FeatureList items={EMPLOYER_CARDS.free.features} />
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

        {/* Pro */}
        <div className="bg-navy text-white border border-navy rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg">{EMPLOYER_CARDS.pro.name}</h3>
            {plan === PLANS.EMPLOYER_PRO ? (
              <PlanBadge plan={PLANS.EMPLOYER_PRO} />
            ) : (
              <span className="text-xs font-semibold bg-white/15 text-white/80 px-2.5 py-1 rounded-full">
                Popular
              </span>
            )}
          </div>
          <div className="flex items-end gap-1 mt-2">
            <span className="text-3xl font-black">
              {isMonthly ? '$49' : '$490'}
            </span>
            <span className="text-white/70 text-sm mb-1">/{isMonthly ? 'mo' : 'yr'}</span>
            {!isMonthly && (
              <span className="ml-2 text-xs font-semibold bg-energyGreen text-white px-2 py-0.5 rounded-full mb-1">
                2 months free
              </span>
            )}
          </div>
          <FeatureList items={EMPLOYER_CARDS.pro.features} dark />
          <div className="mt-6">
            {plan === PLANS.EMPLOYER_PRO ? (
              <div className="w-full py-2 text-center text-sm font-medium bg-white/10 rounded-xl">
                Current Plan
              </div>
            ) : (
              <Button
                className="w-full bg-energyGreen hover:bg-energyGreen-700 text-white"
                loading={proLoading}
                onClick={() => handleUpgrade(proPriceId, 'employer_pro', setProLoad)}
              >
                <Sparkles className="w-4 h-4" /> Upgrade to Pro
              </Button>
            )}
          </div>
        </div>

        {/* Elite */}
        <div className="bg-gradient-to-br from-energyGreen-800 to-energyGreen text-white rounded-2xl p-6 shadow-xl relative overflow-hidden ring-2 ring-energyGreen">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg flex items-center gap-1.5">
              {EMPLOYER_CARDS.elite.name}
              <Crown className="w-4 h-4 text-white/80" />
            </h3>
            {plan === PLANS.EMPLOYER_ELITE && <PlanBadge plan={PLANS.EMPLOYER_ELITE} />}
          </div>
          <div className="flex items-end gap-1 mt-2">
            <span className="text-3xl font-black">
              {isMonthly ? '$98' : '$980'}
            </span>
            <span className="text-white/70 text-sm mb-1">/{isMonthly ? 'mo' : 'yr'}</span>
            {!isMonthly && (
              <span className="ml-2 text-xs font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full mb-1">
                2 months free
              </span>
            )}
          </div>
          <FeatureList items={EMPLOYER_CARDS.elite.features} dark />
          <div className="mt-6">
            {plan === PLANS.EMPLOYER_ELITE ? (
              <div className="w-full py-2 text-center text-sm font-medium bg-white/10 rounded-xl">
                Current Plan
              </div>
            ) : (
              <button
                type="button"
                disabled={eliteLoading}
                onClick={() => handleUpgrade(elitePriceId, 'employer_elite', setEliteLoad)}
                className="w-full inline-flex items-center justify-center gap-2 bg-white text-energyGreen font-semibold rounded-lg px-4 py-2.5 text-sm hover:bg-white/90 transition-all disabled:opacity-60"
              >
                {eliteLoading
                  ? <span className="inline-block w-4 h-4 border-2 border-energyGreen border-t-transparent rounded-full animate-spin" />
                  : <Crown className="w-4 h-4" />}
                Upgrade to Elite
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Comparison table */}
      <div className="max-w-5xl mx-auto overflow-x-auto rounded-2xl border border-gray-200 shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 sm:px-5 py-3 font-semibold text-gray-700">Feature</th>
              <th className="text-center px-2 sm:px-4 py-3 font-semibold text-gray-700 w-16 sm:w-24">Free</th>
              <th className="text-center px-2 sm:px-4 py-3 font-bold text-navy w-16 sm:w-24">Pro</th>
              <th className="text-center px-2 sm:px-4 py-3 font-bold text-energyGreen w-16 sm:w-24">Elite</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {COMPARISON_ROWS.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700">{row.label}</td>
                <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-center"><Cell value={row.free} /></td>
                <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-center"><Cell value={row.pro} /></td>
                <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-center"><Cell value={row.elite} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Boost add-on */}
      <div className="max-w-5xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-6">
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

// ─── Worker plans ─────────────────────────────────────────────────────────────

function WorkerPlans({ plan }) {
  const [billing, setBilling] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  const isMonthly = billing === 'monthly'
  const priceId   = isMonthly ? STRIPE_PRICES.WORKER_PRO_MONTHLY : STRIPE_PRICES.WORKER_PRO_YEARLY

  async function handleUpgrade() {
    if (!user) { navigate('/register?intent=worker_pro'); return }
    setLoading(true)
    setError('')
    try {
      await startSubscriptionCheckout(priceId, 'worker_pro')
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
          <ul className="space-y-2.5 mt-6">
            {WORKER_FEATURES.free.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                <Check className="w-4 h-4 text-energyGreen shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
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
        <div className="bg-energyGreen text-white border border-energyGreen rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg">Worker Pro</h3>
            {plan === PLANS.WORKER_PRO && <PlanBadge plan={PLANS.WORKER_PRO} />}
          </div>
          <div className="flex items-end gap-1 mt-2">
            <span className="text-3xl font-black">
              {isMonthly ? '$7.99' : '$79.99'}
            </span>
            <span className="text-energyGreen-100 text-sm mb-1">/{isMonthly ? 'mo' : 'yr'}</span>
            {!isMonthly && (
              <span className="ml-2 text-xs font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full mb-1">
                2 months free
              </span>
            )}
          </div>
          <ul className="space-y-2.5 mt-6">
            {WORKER_FEATURES.pro.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-energyGreen-50">
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
              <Button variant="white" fullWidth loading={loading} onClick={handleUpgrade}>
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

      {/* Comparison table */}
      <div className="max-w-2xl mx-auto overflow-x-auto rounded-2xl border border-gray-200 shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 sm:px-5 py-3 font-semibold text-gray-700">Feature</th>
              <th className="text-center px-2 sm:px-4 py-3 font-semibold text-gray-700 w-20 sm:w-28">Free</th>
              <th className="text-center px-2 sm:px-4 py-3 font-bold text-energyGreen w-20 sm:w-28">Worker Pro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {WORKER_COMPARISON_ROWS.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700">{row.label}</td>
                <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-center"><Cell value={row.free} /></td>
                <td className="px-2 sm:px-4 py-2.5 sm:py-3 text-center"><Cell value={row.pro} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Pricing() {
  const [searchParams] = useSearchParams()
  const { profile } = useAuth()
  const defaultTab = searchParams.get('tab') === 'worker' ? 'worker' : 'employer'
  const [tab, setTab] = useState(defaultTab)

  const plan = profile?.plan ?? PLANS.FREE
  const role = profile?.role ?? null

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-gray-900">Simple, honest pricing</h1>
          <p className="text-gray-500">No hidden fees. Cancel anytime.</p>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex bg-white border border-gray-200 rounded-2xl p-1 shadow-sm">
            {['employer', 'worker'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  tab === t ? 'bg-navy text-white shadow' : 'text-gray-500 hover:text-gray-700'
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

        <p className="text-center text-xs text-gray-400">
          Subscriptions renew automatically. Cancel anytime from your profile. All prices in USD.
        </p>
      </div>
    </div>
  )
}
