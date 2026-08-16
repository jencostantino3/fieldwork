import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, Sparkles, ClipboardList, Lock, MapPin, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { createJob, getEmployerJobs } from '@/services/jobService'
import { getOwnerCompany } from '@/services/companyService'
import { getCoordinatesFromZip } from '@/utils/helpers'
import Button from '@/components/common/Button'
import ChecklistBuilder, { buildDefaultTasks } from '@/components/checklist/ChecklistBuilder'
import { SPORTS, JOB_TYPES, JOB_CATEGORIES, QUESTION_TYPES } from '@/utils/constants'
import { ROLE_CATEGORIES } from '@/config/roleCategories'

export default function PostJob() {
  const { user, profile, isEmployerPro, isEmployerElite } = useAuth()
  const navigate = useNavigate()
  const [error,      setError]   = useState('')
  const [submitting, setSub]     = useState(false)
  const [atLimit,    setAtLimit] = useState(false)
  const [clTasks,    setClTasks] = useState(buildDefaultTasks())
  const [clNums,     setClNums]  = useState([])

  // Role selector state
  const [roleCategory,  setRoleCategory]  = useState('')
  const [roleSelection, setRoleSelection] = useState('')

  // ZIP lookup state
  const [zipCity,    setZipCity]    = useState('')
  const [zipLoading, setZipLoading] = useState(false)

  useEffect(() => {
    if (!user || isEmployerPro || isEmployerElite) return
    getEmployerJobs(user.uid).then((jobs) => {
      const activeCount = jobs.filter((j) => j.status === 'active').length
      if (activeCount >= 1) setAtLimit(true)
    }).catch(() => {})
  }, [user, isEmployerPro, isEmployerElite])

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      roleType:  'ongoing',
      questions: [{ type: 'text', text: '', required: true }],
    },
  })

  const roleType = watch('roleType')
  const zipCode  = watch('zipCode')
  const { fields, append, remove } = useFieldArray({ control, name: 'questions' })

  // ZIP → city/state lookup
  useEffect(() => {
    if (!/^\d{5}$/.test(zipCode || '')) {
      setZipCity('')
      return
    }
    let cancelled = false
    setZipLoading(true)
    fetch(`https://api.zippopotam.us/us/${zipCode}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (cancelled || !data?.places?.[0]) return
        const { 'place name': city, 'state abbreviation': state } = data.places[0]
        const cityState = `${city}, ${state}`
        setZipCity(cityState)
        setValue('location', cityState, { shouldValidate: true })
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setZipLoading(false) })
    return () => { cancelled = true }
  }, [zipCode, setValue])

  // Role selection → title field
  useEffect(() => {
    if (roleSelection && roleSelection !== 'other') {
      setValue('title', roleSelection, { shouldValidate: true })
    } else if (!roleSelection) {
      setValue('title', '')
    }
  }, [roleSelection, setValue])

  function handleCategorySelect(cat) {
    if (roleCategory === cat) return
    setRoleCategory(cat)
    setRoleSelection('')
    setValue('title', '')
  }

  async function onSubmit(data) {
    setError('')
    setSub(true)
    try {
      const company     = await getOwnerCompany(user.uid)
      let   coordinates = null
      if (data.zipCode?.length === 5) {
        coordinates = await getCoordinatesFromZip(data.zipCode)
      }

      const isEvent = data.roleType === 'event'
      const jobData = {
        title:        data.title,
        sport:        data.sport,
        jobType:      data.jobType,
        category:     data.category,
        description:  data.description,
        requirements: data.requirements || '',
        location:     data.location,
        zipCode:      data.zipCode,
        coordinates,
        salaryMin:    data.salaryMin ? Number(data.salaryMin) : null,
        salaryMax:    data.salaryMax ? Number(data.salaryMax) : null,
        salaryPeriod: data.salaryPeriod || 'year',
        requiresCORI: data.requiresCORI || false,
        companyId:    company?.id ?? null,
        companyName:  company?.name ?? profile?.name ?? 'Unknown',
        roleType:     data.roleType || 'ongoing',
        checklistTemplate: (isEvent && isEmployerElite && clTasks.length > 0)
          ? { tasks: clTasks, notifyNumbers: clNums, createdBy: user.uid }
          : null,
        questions: data.questions
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
        <div className="inline-flex w-14 h-14 rounded-full bg-athleticBlue-50 items-center justify-center">
          <Sparkles className="w-7 h-7 text-navy" />
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

  const selectedCategoryRoles = ROLE_CATEGORIES.find((c) => c.value === roleCategory)?.roles ?? []

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Post a Job</h1>
      <p className="text-gray-500 text-sm mb-6">Fill in the details below. Workers apply by answering your questions — no resume needed.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* Job Details */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Job Details</h2>

          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>

            {/* Hidden input for react-hook-form validation */}
            <input type="hidden" {...register('title', { required: 'Please select a role' })} />

            {/* Step 1: Category buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {ROLE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategorySelect(cat.value)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    roleCategory === cat.value
                      ? 'border-athleticBlue bg-athleticBlue-50 text-athleticBlue'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Step 2: Role dropdown */}
            {roleCategory && (
              <select
                value={roleSelection}
                onChange={(e) => setRoleSelection(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
              >
                <option value="">Select a role...</option>
                {selectedCategoryRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="other">Other — type your own</option>
              </select>
            )}

            {/* Step 3: Custom text input for "Other" */}
            {roleSelection === 'other' && (
              <input
                className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
                placeholder="Enter role title..."
                onChange={(e) => setValue('title', e.target.value, { shouldValidate: true })}
              />
            )}

            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Role Type + Sport */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Type <span className="text-red-500">*</span></label>
              <select
                {...register('roleType')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
              >
                <option value="ongoing">Ongoing / Recurring role</option>
                <option value="event">One-time event (tournament, clinic, camp)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sport <span className="text-red-500">*</span></label>
              <select
                {...register('sport', { required: true })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
              >
                <option value="">Select sport</option>
                {SPORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Job Type + Category */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type <span className="text-red-500">*</span></label>
              <select
                {...register('jobType', { required: true })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
              >
                <option value="">Select type</option>
                {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select
                {...register('category', { required: true })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
              >
                <option value="">Select category</option>
                {JOB_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Location — ZIP-first with auto-fill */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
              <div className="relative">
                <input
                  {...register('zipCode')}
                  maxLength={5}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
                  placeholder="01103"
                />
                {zipLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    Looking up…
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City / Location <span className="text-red-500">*</span>
                {zipCity && (
                  <span className="ml-2 text-xs font-normal text-energyGreen-700 inline-flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3" /> Auto-filled
                  </span>
                )}
              </label>
              <input
                {...register('location', { required: 'Location is required' })}
                readOnly={!!zipCity}
                className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue ${
                  zipCity ? 'bg-gray-50 text-gray-600 cursor-default' : ''
                }`}
                placeholder="Springfield, MA"
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
              placeholder="Describe the role, responsibilities, schedule..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (optional)</label>
            <textarea
              {...register('requirements')}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
              placeholder="Must have valid driver's license, 2+ years coaching experience..."
            />
          </div>
        </section>

        {/* Compensation */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Compensation</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Pay</label>
              <input
                type="number"
                {...register('salaryMin')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Pay</label>
              <input
                type="number"
                {...register('salaryMax')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per</label>
              <select
                {...register('salaryPeriod')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
              >
                <option value="year">Year</option>
                <option value="hour">Hour</option>
                <option value="game">Game</option>
                <option value="season">Season</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register('requiresCORI')} className="accent-athleticBlue" />
            <span className="font-medium text-gray-700">CORI background check required</span>
          </label>
        </section>

        {/* Event Checklist — only shown for event-type roles */}
        {roleType === 'event' && (isEmployerElite ? (
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="w-4 h-4 text-athleticBlue" />
              <h2 className="text-base font-semibold text-gray-900">Event Checklist</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Workers will check off these tasks on event day. You'll get a live status view and optional text alerts.
            </p>
            <ChecklistBuilder
              tasks={clTasks}
              onTasksChange={setClTasks}
              notifyNumbers={clNums}
              onNumbersChange={setClNums}
            />
          </section>
        ) : isEmployerPro ? (
          <section className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-gray-500">Event Checklist</h2>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Build a task checklist for workers, get live completion updates, and receive text alerts on event day.
            </p>
            <Button size="sm" variant="secondary" onClick={() => navigate('/pricing')}>
              <Sparkles className="w-3.5 h-3.5" /> Upgrade to Elite to unlock
            </Button>
          </section>
        ) : null)}

        {/* Application Questions */}
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
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-athleticBlue"
                    >
                      {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                      <input type="checkbox" {...register(`questions.${idx}.required`)} defaultChecked className="accent-athleticBlue" />
                      Required
                    </label>
                  </div>
                  <input
                    {...register(`questions.${idx}.text`)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
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
            className="mt-3 flex items-center gap-2 text-sm text-athleticBlue hover:text-athleticBlue-700 font-medium"
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
