import { CheckCircle, Mail, Star } from 'lucide-react'
import { timeAgo } from '@/utils/helpers'
import { formatRating } from '@/services/ratingService'

export default function RapidFillConfirmedCard({ hold, workerProfile }) {
  const rating = formatRating(workerProfile?.ratingStats)

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 rounded-full bg-energyGreen-50 border border-energyGreen-100 flex items-center justify-center text-sm font-bold text-energyGreen shrink-0">
          {(hold.workerName || '?').charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{hold.workerName}</p>
          {workerProfile?.email && (
            <a
              href={`mailto:${workerProfile.email}`}
              className="inline-flex items-center gap-1 text-xs text-athleticBlue hover:underline mt-0.5"
            >
              <Mail className="w-3 h-3" /> {workerProfile.email}
            </a>
          )}
          {rating && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-semibold text-gray-800">{rating.average.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({rating.count} {rating.count === 1 ? 'rating' : 'ratings'})</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-energyGreen-700 bg-energyGreen-50 border border-energyGreen-200 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> Confirmed
          </span>
          <span className="text-xs text-gray-400">{timeAgo(hold.notifiedAt)}</span>
        </div>
      </div>
    </div>
  )
}
