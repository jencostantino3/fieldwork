import { useEffect, useState } from 'react'
import { ShieldCheck, Plus, CheckCircle, AlertCircle, Sparkles, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getUserBadges, requestBadge } from '@/services/badgeService'
import { getUserApplications } from '@/services/applicationService'
import { openBillingPortal } from '@/services/billingService'
import BadgeDisplay from '@/components/badges/BadgeDisplay'
import PlanBadge from '@/components/billing/PlanBadge'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { BADGE_TYPES, APPLICATION_STATUS, PLANS } from '@/utils/constants'
import { timeAgo } from '@/utils/helpers'

export default function Profile() {
  const { user, profile, isPro, createProfile } = useAuth()
  const navigate = useNavigate()
  const [portalLoading, setPortalLoading] = useState(false)

  async function handlePortal() {
    setPortalLoading(true)
    try { await openBillingPortal() } catch (e) { alert(e.message) }
    setPortalLoading(false)
  }
  const [setupName, setSetupName] = useState('')
  const [setupRole, setSetupRole] = useState('worker')
  const [setupSaving, setSetupSaving] = useState(false)
  const [setupError, setSetupError] = useState('')

  async function handleSetup() {
    if (!setupName.trim()) return
    setSetupSaving(true)
    setSetupError('')
    try {
      await createProfile({ name: setupName.trim(), role: setupRole })
      navigate(setupRole === 'employer' ? '/dashboard' : '/jobs')
    } catch (e) {
      setSetupError(e.message || 'Could not save profile. Please try again.')
    } finally {
      setSetupSaving(false)
    }
  }
  const [badges, setBadges]         = useState([])
  const [applications, setApps]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [badgeModal, setBadgeModal] = useState(false)
  const [selectedType, setType]     = useState('')
  const [expiry, setExpiry]         = useState('')
  const [file, setFile]             = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [badgeSuccess, setBadgeSuccess] = useState(false)
  const [badgeError, setBadgeError] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([
      getUserBadges(user.uid),
      getUserApplications(user.uid),
    ]).then(([b, a]) => {
      setBadges(b)
      setApps(a)
    }).catch((e) => {
      console.warn('[FieldWork] Could not load profile data:', e.message)
    }).finally(() => {
      setLoading(false)
    })
  }, [user])

  async function handleRequestBadge() {
    if (!selectedType) return
    if (!user?.uid) { setBadgeError('Not signed in — please refresh and try again.'); return }
    if (!file) { setBadgeError('Please upload documentation for your credential.'); return }
    setSubmitting(true)
    setBadgeError('')
    try {
      await requestBadge({ userId: user.uid, type: selectedType, expiryDate: expiry, file })
      setType('')
      setExpiry('')
      setFile(null)
      setBadgeSuccess(true)
      getUserBadges(user.uid).then(setBadges).catch(() => {})
    } catch (e) {
      setBadgeError(e.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleCloseBadgeModal() {
    setBadgeModal(false)
    setBadgeSuccess(false)
    setBadgeError('')
  }

  if (loading) return <LoadingSpinner size="lg" className="mt-32" />

  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-card p-8 space-y-5">
        <div className="flex items-center gap-3 text-amber-600">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Your account exists but your profile wasn't saved. Complete setup below.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
          <input
            value={setupName}
            onChange={(e) => setSetupName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">I am a…</label>
          <div className="grid grid-cols-2 gap-3">
            {['worker', 'employer'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSetupRole(r)}
                className={`py-3 rounded-xl border-2 text-sm font-semibold capitalize transition-colors ${
                  setupRole === r ? 'border-brand-navy bg-brand-50 text-brand-navy' : 'border-gray-200 text-gray-500'
                }`}
              >{r === 'worker' ? 'Job Seeker' : 'Employer'}</button>
            ))}
          </div>
        </div>
        {setupError && <p className="text-sm text-red-600">{setupError}</p>}
        <Button fullWidth onClick={handleSetup} loading={setupSaving} disabled={!setupName.trim()}>
          Complete Setup
        </Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Profile header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-50 border-2 border-brand-200 flex items-center justify-center text-2xl font-bold text-brand-navy">
            {(profile?.name || user?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{profile?.name}</h1>
              {isPro && <Sparkles className="w-4 h-4 text-field" />}
            </div>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-semibold text-brand-navy bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full capitalize">
                {profile?.role}
              </span>
              <PlanBadge plan={profile?.plan ?? PLANS.FREE} />
            </div>
          </div>
        </div>
      </div>

      {/* Billing */}
      {isPro ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-brand-navy" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Subscription active</p>
              <p className="text-xs text-gray-500">
                {profile?.subscriptionStatus === 'past_due'
                  ? 'Payment past due — update your payment method'
                  : 'Renews automatically. Cancel anytime.'}
              </p>
            </div>
          </div>
          <Button size="sm" variant="secondary" loading={portalLoading} onClick={handlePortal}>
            Manage
          </Button>
        </div>
      ) : (
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-brand-navy shrink-0" />
            <p className="text-sm text-brand-800">
              <strong>Upgrade to Pro</strong> — unlock all features for your role.
            </p>
          </div>
          <Button size="sm" onClick={() => navigate('/pricing')}>View Plans</Button>
        </div>
      )}

      {/* Badges */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-navy" /> Credentials & Badges
          </h2>
          <Button size="sm" variant="secondary" onClick={() => setBadgeModal(true)}>
            <Plus className="w-4 h-4" /> Add Badge
          </Button>
        </div>

        <BadgeDisplay badges={badges} />

        <p className="text-xs text-gray-400 mt-4">
          Badges must be verified by FieldWork admin before they display to employers.
        </p>
      </div>

      {/* Applications */}
      {profile?.role === 'worker' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Applications ({applications.length})</h2>
          {applications.length === 0 ? (
            <p className="text-sm text-gray-500">You haven't applied to any jobs yet.</p>
          ) : (
            <div className="space-y-3">
              {applications.map((a) => {
                const statusInfo = APPLICATION_STATUS[a.status]
                return (
                  <div key={a.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{a.jobId}</p>
                      <p className="text-xs text-gray-500">{timeAgo(a.appliedAt)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize bg-${statusInfo?.color}-50 text-${statusInfo?.color}-700`}>
                      {a.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Badge request modal */}
      <Modal open={badgeModal} onClose={handleCloseBadgeModal} title="Add a Credential">
        {badgeSuccess ? (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-sm font-medium text-gray-800">
              Submitted for verification! We'll review your credential within 1-2 business days.
            </p>
            <Button fullWidth onClick={handleCloseBadgeModal}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge Type</label>
              <select
                value={selectedType}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              >
                <option value="">Select a badge type...</option>
                {Object.entries(BADGE_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (optional)</label>
              <input
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Documentation
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-navy hover:file:bg-brand-100"
              />
              <p className="text-xs text-gray-400 mt-1">Accepted formats: PDF, JPG, PNG — max 10MB</p>
            </div>

            <p className="text-xs text-gray-500">
              After submitting, FieldWork will review and verify your badge. This may take 1–2 business days.
            </p>

            {badgeError && <p className="text-sm text-red-600">{badgeError}</p>}

            <Button fullWidth onClick={handleRequestBadge} loading={submitting} disabled={!selectedType || !file}>
              Submit for Verification
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
