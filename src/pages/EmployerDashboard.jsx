import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import {
  Briefcase, Users, Zap, Plus, Eye, CheckCircle, AlertCircle, Sparkles, Lock,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getEmployerJobs, deleteJob } from '@/services/jobService'
import { getJobApplications } from '@/services/applicationService'
import { getOwnerCompany, createCompany } from '@/services/companyService'
import { openBillingPortal } from '@/services/billingService'
import ApplicantCard from '@/components/dashboard/ApplicantCard'
import UrgentBoost from '@/components/boost/UrgentBoost'
import PlanBadge from '@/components/billing/PlanBadge'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { timeAgo } from '@/utils/helpers'
import { PLANS } from '@/utils/constants'

export default function EmployerDashboard() {
  const { user, profile, isEmployerPro } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const boostSuccess   = searchParams.get('boost_success')
  const [portalLoading, setPortalLoading] = useState(false)

  const [jobs, setJobs]             = useState([])
  const [company, setCompany]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [activeJobId, setActiveJob] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [appsLoading, setAppsLoad]  = useState(false)
  const [boostJob, setBoostJob]     = useState(null)
  const [companyModal, setCoModal]  = useState(false)
  const [companyName, setCoName]    = useState('')
  const [coSport, setCoSport]       = useState('baseball')
  const [coDesc, setCoDesc]         = useState('')
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const [employerJobs, co] = await Promise.all([
          getEmployerJobs(user.uid),
          getOwnerCompany(user.uid),
        ])
        setJobs(employerJobs)
        setCompany(co)
      } catch (e) {
        console.warn('[FieldWork] Could not load dashboard data:', e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  async function loadApplicants(jobId) {
    setActiveJob(jobId)
    setAppsLoad(true)
    const apps = await getJobApplications(jobId)
    setApplicants(apps)
    setAppsLoad(false)
  }

  async function handleDeleteJob(jobId) {
    if (!confirm('Delete this job? This cannot be undone.')) return
    await deleteJob(jobId)
    setJobs((prev) => prev.filter((j) => j.id !== jobId))
    if (activeJobId === jobId) { setActiveJob(null); setApplicants([]) }
  }

  async function handleSaveCompany() {
    if (!companyName.trim()) return
    setSaving(true)
    try {
      const id = await createCompany({ name: companyName, sport: coSport, description: coDesc }, user.uid)
      const fresh = await getOwnerCompany(user.uid)
      setCompany(fresh)
      setCoModal(false)
    } finally {
      setSaving(false)
    }
  }

  function handleStatusChange(appId, newStatus) {
    setApplicants((prev) => prev.map((a) => a.id === appId ? { ...a, status: newStatus } : a))
  }

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0)
  const activeJobs      = jobs.filter((j) => j.status === 'active')
  const atJobLimit      = !isEmployerPro && activeJobs.length >= 1

  async function handlePortal() {
    setPortalLoading(true)
    try { await openBillingPortal() } catch (e) { alert(e.message) }
    setPortalLoading(false)
  }

  if (loading) return <LoadingSpinner size="lg" className="mt-32" />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
          <p className="text-gray-500 text-sm">{profile?.name} · {company?.name || 'No organization yet'}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <PlanBadge plan={profile?.plan ?? PLANS.FREE} />
          {!company && (
            <Button variant="secondary" onClick={() => setCoModal(true)}>
              <Plus className="w-4 h-4" /> Set Up Organization
            </Button>
          )}
          {atJobLimit ? (
            <Button onClick={() => navigate('/pricing')}>
              <Sparkles className="w-4 h-4" /> Upgrade to Post More
            </Button>
          ) : (
            <Link to="/post-job">
              <Button>
                <Plus className="w-4 h-4" /> Post a Job
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Free-tier job limit warning */}
      {atJobLimit && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-amber-800 font-medium">
              You've used your 1 free job post.{' '}
              <button onClick={() => navigate('/pricing')} className="underline">Upgrade to Pro</button>{' '}
              for unlimited listings.
            </p>
          </div>
        </div>
      )}

      {/* Pro upgrade banner for free employers */}
      {!isEmployerPro && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-brand-navy shrink-0" />
          <p className="text-sm text-brand-800 flex-1">
            <strong>Employer Pro</strong> — unlimited posts, applicant comparison, and badge visibility for $49/mo.
          </p>
          <Button size="sm" onClick={() => navigate('/pricing')}>Upgrade</Button>
        </div>
      )}

      {/* Billing management for Pro subscribers */}
      {isEmployerPro && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-3">
          <p className="text-sm text-brand-800 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> You're on Employer Pro
          </p>
          <Button size="sm" variant="secondary" loading={portalLoading} onClick={handlePortal}>
            Manage Subscription
          </Button>
        </div>
      )}

      {boostSuccess && (
        <div className="bg-field-50 border border-field-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-field shrink-0" />
          <p className="text-sm text-field-700 font-medium">Boost activated! Your job is now marked urgent and pinged to nearby workers.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Jobs',      value: activeJobs.length,      icon: Briefcase, color: 'blue'   },
          { label: 'Total Applicants', value: totalApplicants,         icon: Users,     color: 'green'  },
          { label: 'Urgent Boosts',    value: jobs.filter(j=>j.urgent).length, icon: Zap, color: 'orange' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-card">
            <div className={`w-9 h-9 rounded-lg bg-${s.color}-50 flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 text-${s.color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Boost job modal trigger */}
      {boostJob && (
        <Modal open={!!boostJob} onClose={() => setBoostJob(null)} title="Boost Job">
          <UrgentBoost job={boostJob} />
        </Modal>
      )}

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Job list */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Job Listings ({jobs.length})</h2>

          {jobs.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No jobs posted yet</p>
              <Link to="/post-job" className="mt-3 inline-block">
                <Button size="sm" className="mt-3">Post Your First Job</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={`bg-white border rounded-xl p-4 shadow-card cursor-pointer transition-colors ${
                    activeJobId === job.id ? 'border-brand-navy' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => loadApplicants(job.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {job.urgent && (
                          <span className="text-xs font-bold text-urgent bg-urgent-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Zap className="w-3 h-3" /> URGENT
                          </span>
                        )}
                        <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {job.applicationCount || 0} applicants · {timeAgo(job.createdAt)}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Link
                        to={`/jobs/${job.id}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-gray-400 hover:text-brand-navy rounded-lg hover:bg-gray-50"
                        title="View listing"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {!job.urgent && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setBoostJob(job) }}
                          className="p-1.5 text-gray-400 hover:text-urgent rounded-lg hover:bg-urgent-50"
                          title="Boost job"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id) }}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applicants panel */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {activeJobId ? `Applicants (${applicants.length})` : 'Select a job to view applicants'}
          </h2>

          {!activeJobId ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-400 text-sm">
              Click a job to review its applicants
            </div>
          ) : !isEmployerPro && applicants.length > 3 ? (
            <div className="space-y-3">
              {applicants.slice(0, 3).map((app) => (
                <ApplicantCard
                  key={app.id}
                  application={app}
                  applicantProfile={null}
                  onStatusChange={handleStatusChange}
                />
              ))}
              <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50 p-6 text-center space-y-2">
                <Lock className="w-5 h-5 text-brand-navy mx-auto" />
                <p className="text-sm font-medium text-gray-800">
                  {applicants.length - 3} more applicant{applicants.length - 3 !== 1 ? 's' : ''} hidden
                </p>
                <p className="text-xs text-gray-500">Upgrade to Pro to compare all applicants side-by-side.</p>
                <Button size="sm" onClick={() => navigate('/pricing')}>
                  <Sparkles className="w-3.5 h-3.5" /> Unlock All Applicants
                </Button>
              </div>
            </div>
          ) : appsLoading ? (
            <LoadingSpinner className="py-10" />
          ) : applicants.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No applicants yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applicants.map((app) => (
                <ApplicantCard
                  key={app.id}
                  application={app}
                  applicantProfile={null}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Company setup modal */}
      <Modal open={companyModal} onClose={() => setCoModal(false)} title="Set Up Your Organization">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
            <input
              value={companyName}
              onChange={(e) => setCoName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              placeholder="Springfield Little League"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Sport</label>
            <select
              value={coSport}
              onChange={(e) => setCoSport(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
            >
              <option value="baseball">Baseball</option>
              <option value="basketball">Basketball</option>
              <option value="softball">Softball</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={coDesc}
              onChange={(e) => setCoDesc(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              placeholder="Tell workers about your organization..."
            />
          </div>
          <Button fullWidth onClick={handleSaveCompany} loading={saving} disabled={!companyName.trim()}>
            Save Organization
          </Button>
        </div>
      </Modal>
    </div>
  )
}
