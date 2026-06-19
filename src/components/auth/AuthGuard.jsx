import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function AuthGuard({ children, requireRole }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner size="lg" className="mt-32" />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireRole) {
    if (!profile) return <Navigate to="/profile" state={{ setup: true }} replace />
    if (profile.role !== requireRole) return <Navigate to="/" replace />
  }

  return children
}
