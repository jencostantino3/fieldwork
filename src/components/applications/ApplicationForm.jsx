import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ChevronRight, ChevronLeft, CheckCircle, Sparkles } from 'lucide-react'
import Button from '@/components/common/Button'
import { submitApplication } from '@/services/applicationService'
import { useAuth } from '@/contexts/AuthContext'

export default function ApplicationForm({ job, onSuccess }) {
  const { user, profile, isWorkerPro } = useAuth()
  const [step, setStep]     = useState(0)
  const [done, setDone]     = useState(false)
  const [error, setError]   = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const questions = job.questions || []

  async function onSubmit(formData) {
    setError('')
    try {
      const answers = questions.map((q, i) => ({
        questionId: q.id ?? String(i),
        question:   q.text,
        answer:     formData[`q_${i}`] ?? '',
      }))

      await submitApplication({
        jobId:    job.id,
        userId:   user.uid,
        answers,
        priority: isWorkerPro,
      })
      setDone(true)
      onSuccess?.()
    } catch (e) {
      setError(e.message || 'Failed to submit. Please try again.')
    }
  }

  if (done) {
    return (
      <div className="text-center py-10">
        <CheckCircle className="w-16 h-16 text-field mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
        <p className="text-gray-600">
          The employer will review your answers and reach out via email.
        </p>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-field-50 border border-field-200 rounded-xl p-4 text-sm text-field-700">
          No specific questions — just confirm you want to apply.
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anything you'd like the employer to know?
          </label>
          <textarea
            {...register('q_0')}
            rows={4}
            placeholder="Optional note to the employer..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" fullWidth loading={isSubmitting}>
          Submit Application
        </Button>
      </form>
    )
  }

  const currentQ  = questions[step]
  const isLast    = step === questions.length - 1
  const fieldName = `q_${step}`

  function renderInput() {
    switch (currentQ.type) {
      case 'textarea':
        return (
          <textarea
            key={step}
            {...register(fieldName, { required: currentQ.required && 'This field is required' })}
            rows={5}
            placeholder={currentQ.placeholder || 'Your answer…'}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
        )
      case 'yesno':
        return (
          <div className="flex gap-3">
            {['Yes', 'No'].map((v) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={v}
                  {...register(fieldName, { required: currentQ.required && 'Please select' })}
                  className="accent-brand-navy"
                />
                <span className="text-sm font-medium">{v}</span>
              </label>
            ))}
          </div>
        )
      case 'select':
        return (
          <div className="space-y-2">
            {(currentQ.options || []).map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={opt}
                  {...register(fieldName, { required: currentQ.required && 'Please select' })}
                  className="accent-brand-navy"
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        )
      case 'date':
        return (
          <input
            key={step}
            type="date"
            {...register(fieldName, { required: currentQ.required && 'Date required' })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
        )
      default:
        return (
          <input
            key={step}
            type="text"
            {...register(fieldName, { required: currentQ.required && 'This field is required' })}
            placeholder={currentQ.placeholder || 'Your answer…'}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
        )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Question {step + 1} of {questions.length}</span>
          <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-navy rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-base font-semibold text-gray-900 mb-3">
          {currentQ.text}
          {currentQ.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {renderInput()}
        {errors[fieldName] && (
          <p className="text-red-500 text-xs mt-1">{errors[fieldName].message}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="flex gap-3">
        {step > 0 && (
          <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
        )}
        {isLast ? (
          <Button type="submit" fullWidth loading={isSubmitting}>
            Submit Application
          </Button>
        ) : (
          <Button
            type="button"
            fullWidth
            onClick={() => {
              // RHF validates on submit; for multi-step, use trigger()
              // For simplicity we advance — add trigger() if strict per-step validation needed
              setStep(step + 1)
            }}
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </form>
  )
}
