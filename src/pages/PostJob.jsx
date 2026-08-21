import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, Sparkles, ClipboardList, Lock, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { createJob, getEmployerJobs } from '@/services/jobService'
import { getOwnerCompany } from '@/services/companyService'
import { getCoordinatesFromZip } from '@/utils/helpers'
import Button from '@/components/common/Button'
import ChecklistBuilder, { buildDefaultTasks } from '@/components/checklist/ChecklistBuilder'
import { SPORTS, JOB_TYPES, QUESTION_TYPES } from '@/utils/constants'
import { ROLE_CATEGORIES } from '@/config/roleCategories'

const SELECT_CLS = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue'
const INPUT_CLS  = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue'

export default function PostJob() {
  const { user, profile, isEmployerPro, isEmployerElite } = useAuth()
  const navigate = useNavigate()
  const [error,      setError]   = useState('')
  const [submitting, setSub]     = useState(false)
  const [atLimit,    setAtLimit] = useState(false)
  const [clTasks,    setClTasks] = useState(buildDefaultTasks())
  const [clNums,     setClNums]  = useState([])

  // Linked category → job title state
  const [catSel,   setCatSel]   = useState('')  // ROLE_CATEGORIES value
  const [titleSel, setTitleSel] = useState('')  // role string or 'other'

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
  const { fields, append, remove } = useFieldArray({ control, name: 'questions' })

  // Category selection: sets the Firestore 'category' field via the mapped categoryValue
  function handleCatChange(value) {
    setCatSel(value)
    setTitleSel('')
    setValue('title', '', { shouldValidate: false })
    const cat = ROLE_CATEGORIES.find((c) => c.value === value)
    setValue('category', cat?.categoryValue ?? '', { shouldValidate: !!value })
  }

  // Job Title selection: sets the Firestore 'title' field
  function handleTitleChange(value) {
    setTitleSel(value)
    if (value && value !== 'other') {
      setValue('title', value, { shouldValidate: true })
    } else if (!value) {
      setValue('title', '')
    }
    // 'other' case: title set by the text input below
  }

  // ZIP → city/state lookup via direct onChange
  const zipReg = register('zipCode', { required: 'ZIP code is required' })
  async function handleZipChange(e) {
    zipReg.onChange(e)
    const zip = e.target.value
    if (!/^\d{5}$/.test(zip)) {
      setZipCity('')
      return
    }
    setZipLoading(true)
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      const place = data.places[0]
      const cityState = `${place['place name']}, ${place['state abbreviation']}`
      setZipCity(cityState)
      setValue('location', cityState, { shouldValidate: true })
    } catch {
      setZipCity('')
    } finally {
      setZipLoading(false)
    }
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
        companyName:  profile?.orgName ?? company?.name ?? `${profile?.name ?? 'Unknown'}'s Organization`,
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

  const selectedCat = ROLE_CATEGORIES.find((c) => c.value === catSel)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Post a Job</h1>
      <p className="text-gray-500 text-sm mb-6">Fill in the details below. Workers apply by answering your questions — no resume needed.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* Job Details */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Job Details</h2>

          {/* Hidden inputs — values set programmatically via setValue */}
          <input type="hidden" {...register('category', { required: 'Category is required' })} />
          <input type="hidden" {...register('title',    { required: 'Job title is required' })} />

          {/* Step 1: Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={catSel}
              onChange={(e) => handleCatChange(e.target.value)}
              className={SELECT_CLS}
            >
              <option value="">Select a category...</option>
              {ROLE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>

          {/* Step 2: Job Title — gated on category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <select
              value={titleSel}
              onChange={(e) => handleTitleChange(e.target.value)}
              disabled={!catSel}
              className={`${SELECT_CLS} ${!catSel ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
            >
              <option value="">{catSel ? 'Select a job title...' : 'Select a category first'}</option>
              {selectedCat?.roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
              {catSel && <option value="other">Other — type your own</option>}
            </select>
            {titleSel === 'other' && (
              <input
                autoFocus
                className={`${INPUT_CLS} mt-2`}
                placeholder="Enter job title..."
                onChange={(e) => setValue('title', e.target.value, { shouldValidate: true })}
              />
            )}
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Role Type + Sport */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Type <span className="text-red-500">*</span></label>
              <select {...register('roleType')} className={SELECT_CLS}>
                <option value="ongoing">Ongoing / Recurring role</option>
                <option value="event">One-time event (tournament, clinic, camp)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sport <span className="text-red-500">*</span></label>
              <select {...register('sport', { required: true })} className={SELECT_CLS}>
                <option value="">Select sport</option>
                {SPORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type <span className="text-red-500">*</span></label>
            <select {...register('jobType', { required: true })} className={SELECT_CLS}>
              <option value="">Select type</option>
              {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Location — ZIP first, city/state auto-fills */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...zipReg}
                  onChange={handleZipChange}
                  maxLength={5}
                  inputMode="numeric"
                  className={INPUT_CLS}
                  placeholder="01103"
                />
                {zipLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    Looking up…
                  </span>
                )}
              </div>
              {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode.message}</p>}
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
                className={`${INPUT_CLS} ${zipCity ? 'bg-gray-50 text-gray-600 cursor-default' : ''}`}
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
              className={INPUT_CLS}
              placeholder="Describe the role, responsibilities, schedule..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (optional)</label>
            <textarea
              {...register('requirements')}
              rows={3}
              className={INPUT_CLS}
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
              <input type="number" {...register('salaryMin')} className={INPUT_CLS} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Pay</label>
              <input type="number" {...register('salaryMax')} className={INPUT_CLS} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per</label>
              <select {...register('salaryPeriod')} className={SELECT_CLS}>
                <option value="year">Year</option>
                <option value="hour">Hour</option>
                <option value="game">Game</option>
                <option value="session">Session</option>
                <option value="lesson">Lesson</option>
                <option value="season">Season</option>
                <option value="flat">Flat Rate</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register('requiresCORI')} className="accent-athleticBlue" />
            <span className="font-medium text-gray-700">CORI background check required</span>
          </label>
        </section>

        {/* Event Checklist */}
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
