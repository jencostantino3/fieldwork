import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { CheckCircle, MapPin, GraduationCap, Trophy, MessageSquare } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getCoordinatesFromZip } from '@/utils/helpers'
import { SPORTS_CONFIG } from '@/config/sportsConfig'
import Button from '@/components/common/Button'

const INPUT_CLS  = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue'
const SELECT_CLS = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue'
const ERROR_CLS  = 'text-xs text-red-500 mt-1'

const EXPERIENCE_LEVELS = [
  { value: 'high_school',  label: 'High School' },
  { value: 'collegiate',   label: 'Collegiate' },
  { value: 'professional', label: 'Professional' },
]

const EDUCATION_LEVELS = [
  { value: 'high_school', label: 'High School' },
  { value: 'college',     label: 'College' },
  { value: 'other',       label: 'Other' },
]

export default function WorkerProfile() {
  const { user, profile, updateWorkerProfile } = useAuth()
  const navigate = useNavigate()

  const existingSports = profile?.sports ?? []
  const [selectedSports, setSelectedSports] = useState(
    existingSports.map((s) => s.sportId)
  )
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [saveError, setSaveError] = useState('')
  const [sportsError, setSportsError] = useState('')
  const [zipLoading, setZipLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName:      profile?.firstName      ?? '',
      lastName:       profile?.lastName       ?? '',
      phone:          profile?.phone          ?? '',
      street:         profile?.street         ?? '',
      city:           profile?.city           ?? '',
      state:          profile?.state          ?? '',
      zipCode:        profile?.zipCode        ?? '',
      educationLevel: profile?.educationLevel ?? '',
      schoolName:     profile?.schoolName     ?? '',
      educationOther: profile?.educationOther ?? '',
      bio:            profile?.bio            ?? '',
      ...Object.fromEntries(
        existingSports.map((s) => [`experience_${s.sportId}`, s.experienceLevel])
      ),
    },
  })

  const educationLevel = watch('educationLevel')

  function toggleSport(id) {
    setSportsError('')
    setSelectedSports((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const zipReg = register('zipCode', { required: 'ZIP code is required', pattern: { value: /^\d{5}$/, message: 'Enter a valid 5-digit ZIP' } })
  async function handleZipChange(e) {
    zipReg.onChange(e)
    const zip = e.target.value
    if (!/^\d{5}$/.test(zip)) return
    setZipLoading(true)
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      const place = data.places[0]
      setValue('city',  place['place name'],           { shouldValidate: true })
      setValue('state', place['state abbreviation'],   { shouldValidate: true })
    } catch {
      // leave city/state for manual entry
    } finally {
      setZipLoading(false)
    }
  }

  async function onSubmit(data) {
    if (selectedSports.length === 0) {
      setSportsError('Select at least one sport.')
      return
    }

    setSaving(true)
    setSaveError('')
    try {
      let coordinates = null
      if (data.zipCode?.length === 5) {
        coordinates = await getCoordinatesFromZip(data.zipCode)
      }

      const sports = selectedSports.map((id) => ({
        sportId:         id,
        experienceLevel: data[`experience_${id}`] ?? '',
      }))

      const updates = {
        firstName:      data.firstName.trim(),
        lastName:       data.lastName.trim(),
        name:           `${data.firstName.trim()} ${data.lastName.trim()}`,
        phone:          data.phone.trim(),
        street:         data.street.trim(),
        city:           data.city.trim(),
        state:          data.state.trim(),
        zipCode:        data.zipCode.trim(),
        ...(coordinates ? { coordinates } : {}),
        educationLevel: data.educationLevel,
        ...(data.educationLevel === 'college' ? { schoolName: data.schoolName.trim() } : {}),
        ...(data.educationLevel === 'other'   ? { educationOther: data.educationOther.trim() } : {}),
        sports,
        bio: data.bio.trim(),
      }

      await updateWorkerProfile(updates)
      setSaved(true)
    } catch (e) {
      setSaveError(e.message || 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <CheckCircle className="w-14 h-14 text-energyGreen mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Profile saved!</h2>
          <p className="text-sm text-gray-500">Your worker profile is up to date.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
            <Button variant="secondary" onClick={() => setSaved(false)}>Edit Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Worker Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          This info is shared with employers when you apply for jobs.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Personal Info */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-semibold text-gray-900">Personal Info</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                {...register('firstName', { required: 'First name is required' })}
                className={INPUT_CLS}
                placeholder="Jane"
              />
              {errors.firstName && <p className={ERROR_CLS}>{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                {...register('lastName', { required: 'Last name is required' })}
                className={INPUT_CLS}
                placeholder="Doe"
              />
              {errors.lastName && <p className={ERROR_CLS}>{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              readOnly
              className={`${INPUT_CLS} bg-gray-50 text-gray-500 cursor-not-allowed`}
            />
            <p className="text-xs text-gray-400 mt-1">Your login email — contact support to change it.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cell Phone *</label>
            <input
              type="tel"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: { value: /^[\d\s\-().+]{7,15}$/, message: 'Enter a valid phone number' },
              })}
              className={INPUT_CLS}
              placeholder="(413) 555-0100"
            />
            {errors.phone && <p className={ERROR_CLS}>{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
            <input
              {...register('street', { required: 'Street address is required' })}
              className={INPUT_CLS}
              placeholder="123 Main St"
            />
            {errors.street && <p className={ERROR_CLS}>{errors.street.message}</p>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP *</label>
              <div className="relative">
                <input
                  {...zipReg}
                  onChange={handleZipChange}
                  className={INPUT_CLS}
                  placeholder="01103"
                  maxLength={5}
                />
                {zipLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">...</span>
                )}
              </div>
              {errors.zipCode && <p className={ERROR_CLS}>{errors.zipCode.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                {...register('city', { required: 'City is required' })}
                className={INPUT_CLS}
                placeholder="Springfield"
              />
              {errors.city && <p className={ERROR_CLS}>{errors.city.message}</p>}
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input
                {...register('state', { required: 'State is required' })}
                className={INPUT_CLS}
                placeholder="MA"
                maxLength={2}
              />
              {errors.state && <p className={ERROR_CLS}>{errors.state.message}</p>}
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-4 h-4 text-athleticBlue" />
            <h2 className="text-base font-semibold text-gray-900">Education</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Education Level *</label>
            <select
              {...register('educationLevel', { required: 'Education level is required' })}
              className={SELECT_CLS}
            >
              <option value="">Select level...</option>
              {EDUCATION_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            {errors.educationLevel && <p className={ERROR_CLS}>{errors.educationLevel.message}</p>}
          </div>

          {educationLevel === 'college' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
              <input
                {...register('schoolName')}
                className={INPUT_CLS}
                placeholder="University of Massachusetts"
              />
            </div>
          )}

          {educationLevel === 'other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Please describe</label>
              <input
                {...register('educationOther')}
                className={INPUT_CLS}
                placeholder="Trade school, GED, etc."
              />
            </div>
          )}
        </section>

        {/* Sports & Experience */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-athleticBlue" />
            <h2 className="text-base font-semibold text-gray-900">Sports & Experience</h2>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Sport(s) you're interested in working *</p>
            <div className="flex flex-wrap gap-3">
              {SPORTS_CONFIG.map((sport) => {
                const isComingSoon = sport.status === 'coming_soon'
                const isSelected   = selectedSports.includes(sport.id)
                return (
                  <button
                    key={sport.id}
                    type="button"
                    disabled={isComingSoon}
                    onClick={() => !isComingSoon && toggleSport(sport.id)}
                    className={[
                      'relative px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors',
                      isComingSoon
                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                        : isSelected
                          ? 'border-athleticBlue bg-athleticBlue text-white'
                          : 'border-gray-200 text-gray-700 hover:border-athleticBlue hover:text-athleticBlue',
                    ].join(' ')}
                  >
                    {sport.name}
                    {isComingSoon && (
                      <span className="ml-2 text-[10px] font-semibold tracking-wide text-gray-400">
                        Coming Soon
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {sportsError && <p className={ERROR_CLS}>{sportsError}</p>}
          </div>

          {selectedSports.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700">Playing experience level (per sport)</p>
              {selectedSports.map((id) => {
                const sport = SPORTS_CONFIG.find((s) => s.id === id)
                return (
                  <div key={id} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-24 shrink-0">{sport?.name}</span>
                    <select
                      {...register(`experience_${id}`, { required: `Select experience level for ${sport?.name}` })}
                      className={SELECT_CLS}
                    >
                      <option value="">Select level...</option>
                      {EXPERIENCE_LEVELS.map((l) => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                    {errors[`experience_${id}`] && (
                      <p className={ERROR_CLS}>{errors[`experience_${id}`].message}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Additional Info */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-athleticBlue" />
            <h2 className="text-base font-semibold text-gray-900">Additional Info</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anything else you'd like potential employers to know?
            </label>
            <textarea
              {...register('bio')}
              rows={4}
              className={INPUT_CLS}
              placeholder="Certifications, availability, coaching philosophy, relevant experience..."
            />
          </div>
        </section>

        {saveError && <p className="text-sm text-red-600">{saveError}</p>}

        <div className="flex gap-3">
          <Button type="submit" loading={saving}>
            Save Profile
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/profile')}>
            Cancel
          </Button>
        </div>

      </form>
    </div>
  )
}
