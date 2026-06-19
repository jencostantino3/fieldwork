import { ShieldCheck, Heart, Activity, Zap, Award, Brain, Cross } from 'lucide-react'
import { clsx } from 'clsx'
import { BADGE_TYPES } from '@/utils/constants'
import { formatDate, isExpired } from '@/utils/helpers'

const ICONS = {
  'shield-check':    ShieldCheck,
  'heart-handshake': Heart,
  cross:             Cross,
  activity:          Activity,
  zap:               Zap,
  brain:             Brain,
  award:             Award,
}

const COLOR_MAP = {
  blue:   'bg-blue-50 text-blue-700 border-blue-200',
  green:  'bg-green-50 text-green-700 border-green-200',
  red:    'bg-red-50 text-red-700 border-red-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  teal:   'bg-teal-50 text-teal-700 border-teal-200',
  gray:   'bg-gray-50 text-gray-500 border-gray-200',
}

export default function BadgeDisplay({ badges = [], size = 'md' }) {
  if (!badges.length) {
    return <p className="text-sm text-gray-500 italic">No badges yet.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => {
        const config   = BADGE_TYPES[badge.type] ?? { label: badge.type, color: 'gray', icon: 'award' }
        const Icon     = ICONS[config.icon] ?? Award
        const expired  = badge.expiryDate && isExpired(badge.expiryDate)
        const verified = badge.status === 'verified' && !expired
        const colors   = verified ? COLOR_MAP[config.color] : COLOR_MAP.gray

        return (
          <div
            key={badge.id ?? badge.type}
            title={expired ? `Expired ${formatDate(badge.expiryDate)}` : config.label}
            className={clsx(
              'inline-flex items-center gap-1.5 border rounded-full font-medium',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              colors,
              expired && 'opacity-50 line-through'
            )}
          >
            <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
            {config.label}
            {badge.status === 'pending' && (
              <span className="text-xs text-yellow-600 font-normal">(pending)</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
