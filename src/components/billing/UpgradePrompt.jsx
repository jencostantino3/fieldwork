import { Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/Button'

export default function UpgradePrompt({ title, description, variant = 'employer' }) {
  const navigate = useNavigate()
  return (
    <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50 px-6 py-8 text-center space-y-3">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-100">
        <Sparkles className="w-5 h-5 text-brand-navy" />
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-xs mx-auto">{description}</p>}
      <Button
        size="sm"
        onClick={() => navigate(`/pricing?tab=${variant}`)}
      >
        Upgrade to Pro
      </Button>
    </div>
  )
}
