import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  MapPin, Clock, Briefcase, Tag, ShieldCheck, Zap, Building2, ChevronLeft,
} from 'lucide-react'
import { getJob } from '@/services/jobService'
import { hasApplied } from '@/services/applicationService'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import ApplicationForm from '@/components/applications/ApplicationForm'
import { timeAgo, formatSalary } from '@/utils/helpers'
import { JOB_TYPES, JOB_CATEGORIES, SPORTS } from '@/utils/constants'

function pill(list, value) {
  return list.find((i) => i.value === value)?.label ?? value
}

export default function JobDetail() {
  const { id }            = useParams()
  const { user, profile } = useAuth()
  const navigate          = useNavigate()

  const [job, setJob]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [applied, setApplied]   = useState(false)
  const [applyOpen, setApply]   = useState(false)

  useEffect(() => {
    async function load() {
      const j = await getJob(id)
      setJob(j)
      if (user && j) {
        const a = await hasApplied(id, user.uid)
        setApplied(a)
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

  const canApply = !applied && profile?.role !== 'employer'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-navy mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Main */}
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 shadow-card">
            {job.urgent && (
              <div className="inline-flex items-center gap-1.5 text-sm font-bold text-urgent bg-urgent-50 border border-urgent-200 px-3 py-1 rounded-full mb-4">
                <Zap className="w-4 h-4" /> URGENT – Last-Minute Opening
              </div>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{job.title}</h1>

            <div className="flex items-center gap-2 text-gray-600 mb-5">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{job.companyName}</span>
            </div>

            <div className="flex flex-wrap gap-3 text-sm mb-5">
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5" /> {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full">
                <Briefcase className="w-3.5 h-3.5" /> {pill(JOB_TYPES, job.jobType)}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-field-50 text-field-700 px-3 py-1.5 rounded-full">
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
              <p className="text-xl font-bold text-field mb-5">
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
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-card">
            {applied ? (
              <div className="text-center py-2">
                <div className="w-12 h-12 bg-field-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6 text-field" />
                </div>
                <p className="font-semibold text-gray-800">Applied!</p>
                <p className="text-sm text-gray-500 mt-1">Your application was submitted.</p>
              </div>
            ) : (
              <Button fullWidth size="lg" onClick={handleApplyClick}>
                Apply Now
              </Button>
            )}
            <p className="text-xs text-gray-500 text-center mt-3">No resume needed — just answer a few questions.</p>
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

      <Modal open={applyOpen} onClose={() => setApply(false)} title={`Apply: ${job.title}`} size="lg">
        <ApplicationForm job={job} onSuccess={() => { setApply(false); setApplied(true) }} />
      </Modal>
    </div>
  )
}
