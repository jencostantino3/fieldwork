import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  MapPin, Clock, Briefcase, Tag, ShieldCheck, Zap, Building2, ChevronLeft, ClipboardList,
} from 'lucide-react'
import { getJob } from '@/services/jobService'
import { hasApplied, getApplicationForJob } from '@/services/applicationService'
import { hasInteractedWithRating } from '@/services/ratingService'
import RatingModal from '@/components/ratings/RatingModal'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import ApplicationForm from '@/components/applications/ApplicationForm'
import RapidFillBadge from '@/components/rapidFill/RapidFillBadge'
import RapidFillAction from '@/components/rapidFill/RapidFillAction'
import WorkerChecklist from '@/components/checklist/WorkerChecklist'
import { timeAgo, formatSalary } from '@/utils/helpers'
import { JOB_TYPES, JOB_CATEGORIES, SPORTS } from '@/utils/constants'

function pill(list, value) {
  return list.find((i) => i.value === value)?.label ?? value
}

export default function JobDetail() {
  const { id }            = useParams()
  const { user, profile } = useAuth()
  const navigate          = useNavigate()

  const [job, setJob]             = useState(null)
  const [loading, setLoading]     = useState(true)
  const [applied, setApplied]     = useState(false)
  const [applyOpen, setApply]     = useState(false)
  const [activeTab, setTab]       = useState('details') // 'details' | 'checklist'
  const [ratingOpen, setRatingOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const j = await getJob(id)
      setJob(j)
      if (user && j) {
        const a = await hasApplied(id, user.uid)
        setApplied(a)
        if (j.status === 'completed' && profile?.role !== 'employer') {
          const app = await getApplicationForJob(id, user.uid)
          if (app?.status === 'accepted') {
            const already = await hasInteractedWithRating(user.uid, id)
            if (!already) setRatingOpen(true)
          }
        }
      }
      setLoading(false)
    }
    load()
  }, [id, user])

  if (loading) return <LoadingSpinner size="lg" className="mt-32" />
  if (!job)    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">Job not found.</div>

  function handleApplyClick() {
    if (!user) return navigate('/login', { state: { from: `/jobs/${id}` } })
    setApply(true)
  }

  const isWorker    = profile?.role !== 'employer'
  const isOwnJob    = profile?.role === 'employer' && job?.employerId === user?.uid
  const canApply    = !applied && isWorker
  const showChecklist = isWorker && job?.roleType === 'event' && !!job?.checklistTemplate

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-28 lg:pb-8">
      <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-athleticBlue mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      {/* Tab switcher — only for event jobs with a checklist, workers only */}
      {showChecklist && (
        <div className="flex text-sm rounded-lg border border-gray-200 overflow-hidden mb-5 w-fit">
          <button
            onClick={() => setTab('details')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'details' ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Job Details
          </button>
          <button
            onClick={() => setTab('checklist')}
            className={`px-4 py-2 font-medium transition-colors border-l border-gray-200 flex items-center gap-1.5 ${
              activeTab === 'checklist' ? 'bg-energyGreen text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" /> My Checklist
          </button>
        </div>
      )}

      {/* Checklist tab */}
      {showChecklist && activeTab === 'checklist' ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Event Checklist</h2>
          <WorkerChecklist job={job} />
        </div>
      ) : (

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Main */}
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 shadow-card">
            <div className="flex flex-wrap gap-2 mb-4">
              {job.rapidFill && <RapidFillBadge size="lg" />}
              {job.urgent && (
                <div className="inline-flex items-center gap-1.5 text-sm font-bold text-urgent bg-urgent-50 border border-urgent-200 px-3 py-1 rounded-full">
                  <Zap className="w-4 h-4" /> URGENT – Last-Minute Opening
                </div>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{job.title}</h1>

            <div className="flex items-center gap-2 text-gray-600 mb-5">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{job.companyName}</span>
            </div>

            <div className="flex flex-wrap gap-3 text-sm mb-5">
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5" /> {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-athleticBlue-50 text-athleticBlue px-3 py-1.5 rounded-full">
                <Briefcase className="w-3.5 h-3.5" /> {pill(JOB_TYPES, job.jobType)}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-energyGreen-50 text-energyGreen-700 px-3 py-1.5 rounded-full">
                <Tag className="w-3.5 h-3.5" /> {pill(JOB_CATEGORIES, job.category)}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                {pill(SPORTS, job.sport)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" /> Posted {timeAgo(job.createdAt)}
              </span>
            </div>

            {(job.salaryMin || job.salaryMax) && (
              <p className="text-xl font-bold text-energyGreen mb-5">
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod)}
              </p>
            )}

            {job.requiresCORI && (
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 mb-5">
                <ShieldCheck className="w-4 h-4" />
                CORI background check required for this position.
              </div>
            )}

            <div className="prose prose-gray max-w-none">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About this Role</h2>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                {job.description}
              </div>

              {job.requirements && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Requirements</h2>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {job.requirements}
                  </div>
                </>
              )}
            </div>

            {(job.questions || []).length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Application Questions ({job.questions.length})
                </h2>
                <ol className="space-y-2 list-decimal list-inside">
                  {job.questions.map((q, i) => (
                    <li key={i} className="text-sm text-gray-700">{q.text}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Rapid Fill action — workers only */}
          {job.rapidFill && isWorker && (
            <div className="bg-white border border-rapidFill-200 rounded-2xl p-5 shadow-card">
              <p className="text-xs font-bold text-rapidFill uppercase tracking-wide mb-3">Rapid Fill — Needed Now</p>
              <RapidFillAction job={job} />
            </div>
          )}

          <div className="hidden lg:block bg-white border border-gray-200 rounded-2xl p-5 shadow-card">
            {isOwnJob ? (
              <div className="space-y-2">
                <Button fullWidth size="lg" variant="secondary" onClick={() => navigate('/dashboard')}>
                  Manage on Dashboard
                </Button>
                <p className="text-xs text-gray-500 text-center">View applicants and manage this listing.</p>
              </div>
            ) : applied ? (
              <div className="text-center py-2">
                <div className="w-12 h-12 bg-energyGreen-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6 text-energyGreen" />
                </div>
                <p className="font-semibold text-gray-800">Applied!</p>
                <p className="text-sm text-gray-500 mt-1">Your application was submitted.</p>
              </div>
            ) : (
              <>
                <Button fullWidth size="lg" onClick={handleApplyClick}>
                  {job.rapidFill && isWorker ? 'Apply Instead' : 'Apply Now'}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-3">No resume needed — just answer a few questions.</p>
              </>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-card text-sm text-gray-600 space-y-2">
            <p><strong className="text-gray-900">Organization:</strong> {job.companyName}</p>
            <p><strong className="text-gray-900">Location:</strong> {job.location}</p>
            <p><strong className="text-gray-900">Type:</strong> {pill(JOB_TYPES, job.jobType)}</p>
            <p><strong className="text-gray-900">Sport:</strong> {pill(SPORTS, job.sport)}</p>
            {job.applicationCount != null && (
              <p><strong className="text-gray-900">Applicants:</strong> {job.applicationCount}</p>
            )}
          </div>
        </div>
      </div>

      )} {/* end details/checklist ternary */}

      {/* Sticky mobile apply bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg z-40">
        {isOwnJob ? (
          <Button fullWidth size="lg" variant="secondary" onClick={() => navigate('/dashboard')}>
            Manage on Dashboard
          </Button>
        ) : applied ? (
          <div className="flex items-center justify-center gap-2 text-energyGreen font-semibold text-sm py-2">
            <ShieldCheck className="w-4 h-4" /> Applied — you're in!
          </div>
        ) : (
          <Button fullWidth size="lg" onClick={handleApplyClick}>
            {job.rapidFill && isWorker ? 'Apply Instead' : 'Apply Now'}
          </Button>
        )}
      </div>

      <Modal open={applyOpen} onClose={() => setApply(false)} title={`Apply: ${job.title}`} size="lg">
        <ApplicationForm job={job} onSuccess={() => { setApply(false); setApplied(true) }} />
      </Modal>

      <RatingModal
        open={ratingOpen}
        toUid={job.employerId}
        jobId={id}
        ratedRole="employer"
        ratedName={job.companyName || 'this employer'}
        onDone={() => setRatingOpen(false)}
      />
    </div>
  )
}
