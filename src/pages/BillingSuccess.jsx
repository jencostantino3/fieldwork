import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Crown, Sparkles, Zap, LayoutDashboard, Briefcase } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const PLAN_META = {
  employer_pro: {
    label:    'Employer Pro',
    headline: "You're now on Employer Pro!",
    sub:      'Unlimited job posts, applicant comparison, and verified credential badges are all yours.',
    Icon:     Sparkles,
    accent:   'text-athleticBlue',
    ring:     'ring-athleticBlue/30',
    bg:       'bg-athleticBlue/10',
  },
  employer_elite: {
    label:    'Employer Elite',
    headline: "You're now on Employer Elite!",
    sub:      'Event checklists, photo verification, live day-of status, and automated alerts are unlocked.',
    Icon:     Crown,
    accent:   'text-energyGreen',
    ring:     'ring-energyGreen/30',
    bg:       'bg-energyGreen/10',
  },
  worker_pro: {
    label:    'Worker Pro',
    headline: "You're now a Worker Pro!",
    sub:      'Your applications are flagged Priority, you get 24-hour early access, and your Pro badge is live.',
    Icon:     Sparkles,
    accent:   'text-energyGreen',
    ring:     'ring-energyGreen/30',
    bg:       'bg-energyGreen/10',
  },
  boost: {
    label:    'Urgent Boost',
    headline: 'Boost activated!',
    sub:      'Your listing is pinned to the top for 48 hours and nearby verified workers have been notified.',
    Icon:     Zap,
    accent:   'text-rapidFill',
    ring:     'ring-rapidFill/30',
    bg:       'bg-rapidFill/10',
  },
}

const FALLBACK = {
  label:    'your new plan',
  headline: "You're upgraded!",
  sub:      'Your subscription is active and your new features are unlocked immediately.',
  Icon:     CheckCircle,
  accent:   'text-energyGreen',
  ring:     'ring-energyGreen/30',
  bg:       'bg-energyGreen/10',
}

export default function BillingSuccess() {
  const [searchParams] = useSearchParams()
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const planKey = searchParams.get('plan') ?? (searchParams.has('boost') ? 'boost' : null)
  const meta    = PLAN_META[planKey] ?? FALLBACK
  const { Icon, headline, sub, accent, ring, bg } = meta

  const isEmployer    = profile?.role === 'employer'
  const destination   = isEmployer ? '/dashboard' : '/jobs'
  const ctaLabel      = isEmployer ? 'Go to Dashboard' : 'Browse Jobs'
  const CtaIcon       = isEmployer ? LayoutDashboard : Briefcase

  useEffect(() => {
    const t = setTimeout(refreshProfile, 2000)
    return () => clearTimeout(t)
  }, [refreshProfile])

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8 text-center">

        {/* Icon badge */}
        <div className={`inline-flex w-20 h-20 rounded-full ${bg} ring-4 ${ring} items-center justify-center mx-auto`}>
          <Icon className={`w-10 h-10 ${accent}`} />
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-white leading-tight">
            {headline}
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto">
            {sub}
          </p>
        </div>

        {/* CTA card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">
            What's next
          </p>
          <button
            onClick={() => navigate(destination)}
            className="w-full inline-flex items-center justify-center gap-2.5 bg-energyGreen hover:bg-energyGreen-700 text-white font-semibold rounded-xl px-6 py-3.5 text-sm transition-colors"
          >
            <CtaIcon className="w-4 h-4" />
            {ctaLabel}
          </button>
          <button
            onClick={() => navigate('/pricing')}
            className="w-full text-white/40 hover:text-white/70 text-xs transition-colors py-1"
          >
            View pricing details
          </button>
        </div>

      </div>
    </div>
  )
}
