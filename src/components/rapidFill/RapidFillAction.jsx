import { useState, useEffect } from 'react'
import { Flame, Clock, CheckCircle, XCircle } from 'lucide-react'
import { claimRapidFill, subscribeToWorkerHoldsForJob } from '@/services/rapidFillService'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/Button'

function countdown(expiresAt) {
  if (!expiresAt) return '0:00'
  const ms = expiresAt.toDate().getTime() - Date.now()
  if (ms <= 0) return '0:00'
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return `${min}:${String(sec).padStart(2, '0')}`
}

export default function RapidFillAction({ job }) {
  const { user, profile } = useAuth()
  const navigate          = useNavigate()
  const [hold, setHold]   = useState(undefined) // undefined = initial load
  const [claiming, setClaim] = useState(false)
  const [error, setError]    = useState('')
  const [, setTick]          = useState(0)

  useEffect(() => {
    if (!user || !job?.id) {
      setHold(null)
      return
    }
    return subscribeToWorkerHoldsForJob(user.uid, job.id, setHold)
  }, [user, job?.id])

  // Live countdown ticker while pending
  useEffect(() => {
    if (hold?.status !== 'pending') return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [hold?.status])

  async function handleClaim() {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${job.id}` } })
      return
    }
    setClaim(true)
    setError('')
    try {
      await claimRapidFill(job.id, {
        uid:   user.uid,
        name:  profile?.name || user.displayName,
        email: user.email,
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setClaim(false)
    }
  }

  if (hold === undefined) return null

  if (hold?.status === 'confirmed') {
    return (
      <div className="rounded-xl bg-energyGreen-50 border border-energyGreen-200 p-4 text-center space-y-1.5">
        <CheckCircle className="w-8 h-8 text-energyGreen mx-auto" />
        <p className="font-semibold text-gray-900">You're confirmed!</p>
        <p className="text-sm text-gray-500">The employer has selected you for this position.</p>
      </div>
    )
  }

  if (hold?.status === 'rejected') {
    return (
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center space-y-1.5">
        <XCircle className="w-8 h-8 text-steelGray mx-auto" />
        <p className="font-semibold text-gray-900">Position filled</p>
        <p className="text-sm text-gray-500">The employer confirmed another worker for this role.</p>
      </div>
    )
  }

  if (hold?.status === 'expired') {
    return (
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center space-y-1.5">
        <Clock className="w-8 h-8 text-steelGray mx-auto" />
        <p className="font-semibold text-gray-900">Hold expired</p>
        <p className="text-sm text-gray-500">
          {job.rapidFill
            ? 'The position is still open — tap again to re-queue.'
            : 'This position has been filled.'}
        </p>
        {job.rapidFill && (
          <Button
            variant="rapidFill"
            size="sm"
            className="mt-1"
            onClick={handleClaim}
            loading={claiming}
          >
            <Flame className="w-3.5 h-3.5" /> Queue Again
          </Button>
        )}
      </div>
    )
  }

  if (hold?.status === 'pending') {
    return (
      <div className="rounded-xl bg-rapidFill-50 border border-rapidFill-200 p-4 text-center space-y-1.5">
        <Flame className="w-8 h-8 text-rapidFill mx-auto" />
        <p className="font-semibold text-gray-900">You're in the queue!</p>
        <p className="text-sm text-gray-500">Waiting for the employer to confirm.</p>
        <div className="flex items-center justify-center gap-1.5 text-lg font-mono font-bold text-rapidFill">
          <Clock className="w-4 h-4" />
          {countdown(hold.expiresAt)}
        </div>
        <p className="text-xs text-gray-400">Hold expires in 15 min if not confirmed.</p>
      </div>
    )
  }

  // No hold — show the claim button
  return (
    <div className="space-y-2">
      <Button
        variant="rapidFill"
        fullWidth
        size="lg"
        onClick={handleClaim}
        loading={claiming}
      >
        <Flame className="w-5 h-5" /> I'm Available Now
      </Button>
      <p className="text-xs text-gray-500 text-center">
        One tap — uses your saved profile. You'll hold this spot for 15 min.
      </p>
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
    </div>
  )
}
