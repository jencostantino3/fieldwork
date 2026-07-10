import { useState } from 'react'
import { Zap, Clock, Users, AlertCircle } from 'lucide-react'
import Button from '@/components/common/Button'
import { startBoostCheckout } from '@/services/billingService'
import { BOOST_DURATION_HRS, BOOST_RADIUS_MILES } from '@/utils/constants'

export default function UrgentBoost({ job }) {
  const isAlreadyBoosted = job.urgent
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleBoost() {
    setLoading(true)
    setError('')
    try {
      await startBoostCheckout(job.id, job.title)
    } catch (e) {
      setError(e.message || 'Could not start checkout. Please try again.')
      setLoading(false)
    }
  }

  if (isAlreadyBoosted) {
    return (
      <div className="bg-urgent-50 border border-urgent-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-urgent" />
          <span className="font-semibold text-urgent-700">Boost Active</span>
        </div>
        <p className="text-sm text-urgent-600">
          This job is marked urgent and boosted to nearby workers.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-urgent-50 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-urgent" />
        </div>
        <h3 className="font-semibold text-gray-900">Urgent Boost</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Need someone <strong>fast?</strong> Boost this job to ping qualified workers within{' '}
        <strong>{BOOST_RADIUS_MILES} miles</strong>. Your listing gets an urgent badge and priority
        placement for <strong>{BOOST_DURATION_HRS} hours</strong>.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4 text-brand-navy" />
          Notify nearby workers
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4 text-brand-navy" />
          {BOOST_DURATION_HRS}h priority listing
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <Button variant="urgent" fullWidth onClick={handleBoost} loading={loading}>
        <Zap className="w-4 h-4" /> Boost This Job — $20
      </Button>
    </div>
  )
}
