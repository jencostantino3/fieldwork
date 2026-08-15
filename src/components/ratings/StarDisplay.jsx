import { Star } from 'lucide-react'

export default function StarDisplay({ stats, size = 'sm' }) {
  if (!stats) return null
  const sm = size === 'sm'
  return (
    <div className="flex items-center gap-1.5">
      <Star className={`${sm ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-yellow-400 fill-yellow-400`} />
      <span className={`${sm ? 'text-xs' : 'text-sm'} font-semibold text-gray-800`}>
        {stats.average.toFixed(1)}
      </span>
      <span className={`${sm ? 'text-xs' : 'text-sm'} text-gray-400`}>
        ({stats.count} {stats.count === 1 ? 'rating' : 'ratings'})
      </span>
    </div>
  )
}
