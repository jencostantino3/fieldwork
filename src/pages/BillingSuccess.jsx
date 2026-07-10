import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/common/Button'

export default function BillingSuccess() {
  const [searchParams] = useSearchParams()
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const isBoost = searchParams.has('boost')

  useEffect(() => {
    // Refresh the profile so the plan badge updates immediately
    const t = setTimeout(refreshProfile, 2000)
    return () => clearTimeout(t)
  }, [refreshProfile])

  const destination = profile?.role === 'employer' ? '/dashboard' : '/jobs'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-card border border-gray-200 p-10 max-w-md w-full text-center space-y-4">
        <div className="inline-flex w-16 h-16 rounded-full bg-field-50 items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-field" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isBoost ? 'Boost activated!' : "You're on Pro!"}
        </h1>
        <p className="text-gray-500 text-sm">
          {isBoost
            ? 'Your job listing is now pinned to the top and nearby workers have been notified.'
            : 'Your subscription is active. All Pro features are unlocked immediately.'}
        </p>
        <Button fullWidth onClick={() => navigate(destination)}>
          {profile?.role === 'employer' ? 'Go to Dashboard' : 'Browse Jobs'}
        </Button>
      </div>
    </div>
  )
}
