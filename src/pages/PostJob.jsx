import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { createJob, getEmployerJobs } from '@/services/jobService'
import { getOwnerCompany } from '@/services/companyService'
import { getCoordinatesFromZip } from '@/utils/helpers'
import Button from '@/components/common/Button'
import { SPORTS, JOB_TYPES, JOB_CATEGORIES, QUESTION_TYPES } from '@/utils/constants'

export default function PostJob() {
  const { user, profile, isEmployerPro } = useAuth()
  const navigate = useNavigate()
  const [error, setError]   = useState('')
  const [submitting, setSub]= useState(false)
  const [atLimit, setAtLimit] = useState(false)

  useEffect(() => {
    if (!user || isEmployerPro) return
    getEmployerJobs(user.uid).then((jobs) => {
      const activeCount = jobs.filter((j) => j.status === 'active').length
      if (activeCount >= 1) setAtLimit(true)
    }).catch(() => {})
  }, [user, isEmployerPro])

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      questions: [{ type: 'text', text: '', required: true }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' })

  async function onSubmit(data) {
    setError('')
    setSub(true)
    try {
      const company = await getOwnerCompany(user.uid)

      let coordinates = null
      if (data.zipCode?.length === 5) {
        coordinates = await getCoordinatesFromZip(data.zipCode)
      }

      const jobData = {
        title:       data.title,
        sport:       data.sport,
        jobType:     data.jobType,
        category:    data.category,
        description: data.description,
        requirements: data.requirements || '',
        location:    data.location,
        zipCode:     data.zipCode,
        coordinates,
        salaryMin:   data.salaryMin ? Number(data.salaryMin) : null,
        salaryMax:   data.salaryMax ? Number(data.salaryMax) : null,
        salaryPeriod: data.salaryPeriod || 'year',
        requiresCORI: data.requiresCORI || false,
        companyId:   company?.id ?? null,
        companyName: company?.name ?? profile?.name ?? 'Unknown',
        questions:   data.questions
          .filter((q) => q.text.trim())
          .map((q, i) => ({ ...q, id: String(i) })),
      }

      const id = await createJob(jobData, user.uid)
      navigate(`/jobs/${id}`)
    } catch (e) {
      setError(e.message || 'Failed to post job.')
      setSub(false)
    }
  }

  if (atLimit) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-4">
        <div className="inline-flex w-14 h-14 rounded-full bg-brand-50 items-center justify-center">
          <Sparkles className="w-7 h-7 text-brand-navy" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Free plan limit reached</h1>
        <p className="text-gray-500 text-sm">
          You already have an active job post. Upgrade to Employer Pro to post unlimited jobs.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          <Button onClick={() => navigate('/pricing')}>Upgrade to Pro</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Post a Job</h1>
      <p className="text-gray-500 text-sm mb-6">Fill in the details below. Workers apply by answering your questions — no resume needed.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic info */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Job Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title <span className="text-red-500">*</span></label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              placeholder="Head Softball Coach"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sport <span className="text-red-500">*</span></label>
              <select
                {...register('sport', { required: true })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              >
                <option value="">Select sport</option>
                {SPORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type <span className="text-red-500">*</span></label>
              <select
                {...register('jobType', { required: true })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              >
                <option value="">Select type</option>
                {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select
                {...register('category', { required: true })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              >
                <option value="">Select category</option>
                {JOB_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City / Location <span className="text-red-500">*</span></label>
              <input
                {...register('location', { required: 'Location is required' })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                placeholder="Springfield, MA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
              <input
                {...register('zipCode')}
                maxLength={5}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                placeholder="01103"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              placeholder="Describe the role, responsibilities, schedule..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (optional)</label>
            <textarea
              {...register('requirements')}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              placeholder="Must have valid driver's license, 2+ years coaching experience..."
            />
          </div>
        </section>

        {/* Pay */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Compensation</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Pay</label>
              <input
                type="number"
                {...register('salaryMin')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Pay</label>
              <input
                type="number"
                {...register('salaryMax')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per</label>
              <select
                {...register('salaryPeriod')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
              >
                <option value="year">Year</option>
                <option value="hour">Hour</option>
                <option value="game">Game</option>
                <option value="season">Season</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register('requiresCORI')} className="accent-brand-navy" />
            <span className="font-medium text-gray-700">CORI background check required</span>
          </label>
        </section>

        {/* Questions */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Application Questions</h2>
            <span className="text-xs text-gray-500">Workers answer these instead of submitting a resume</span>
          </div>

          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <select
                      {...register(`questions.${idx}.type`)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-navy"
                    >
                      {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                      <input type="checkbox" {...register(`questions.${idx}.required`)} defaultChecked className="accent-brand-navy" />
                      Required
                    </label>
                  </div>
                  <input
                    {...register(`questions.${idx}.text`)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    placeholder={`Question ${idx + 1}...`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  disabled={fields.length === 1}
                  className="text-gray-400 hover:text-red-500 p-1 self-start disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => append({ type: 'text', text: '', required: false })}
            className="mt-3 flex items-center gap-2 text-sm text-brand-navy hover:text-brand-800 font-medium"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </section>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-4">
          <Button type="submit" size="lg" loading={submitting} fullWidth>
            Post Job
          </Button>
        </div>
      </form>
    </div>
  )
}
