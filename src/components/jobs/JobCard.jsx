import { Link } from 'react-router-dom'
import { MapPin, Clock, Zap, ShieldCheck } from 'lucide-react'
import { clsx } from 'clsx'
import { timeAgo, formatSalary } from '@/utils/helpers'
import { JOB_TYPES, JOB_CATEGORIES, SPORTS } from '@/utils/constants'
import RapidFillBadge from '@/components/rapidFill/RapidFillBadge'

function pill(list, value) {
  return list.find((i) => i.value === value)?.label ?? value
}

export default function JobCard({ job }) {
  const isUrgent    = job.urgent && job.boostExpiry
  const isRapidFill = job.rapidFill

  return (
    <Link
      to={`/jobs/${job.id}`}
      className={clsx(
        'block bg-white rounded-xl border shadow-card hover:shadow-card-hover transition-all duration-200 p-5 relative overflow-hidden',
        isRapidFill && 'border-rapidFill-200',
        !isRapidFill && isUrgent && 'border-urgent-300'
      )}
    >
      {isRapidFill && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rapidFill to-rapidFill-700" />
      )}
      {!isRapidFill && isUrgent && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-urgent-500 to-amber-400" />
      )}

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-athleticBlue-50 border border-athleticBlue-100 flex items-center justify-center text-xl font-bold text-navy shrink-0">
          {job.companyName?.charAt(0) ?? '?'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            {isRapidFill && <RapidFillBadge />}
            {!isRapidFill && isUrgent && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-urgent bg-urgent-50 border border-urgent-200 px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3" /> URGENT
              </span>
            )}
            {job.requiresCORI && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> CORI
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
          <p className="text-sm text-gray-600 truncate">{job.companyName}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
          {pill(SPORTS, job.sport)}
        </span>
        <span className="text-xs bg-athleticBlue-50 text-athleticBlue px-2.5 py-1 rounded-full">
          {pill(JOB_TYPES, job.jobType)}
        </span>
        <span className="text-xs bg-energyGreen-50 text-energyGreen-700 px-2.5 py-1 rounded-full">
          {pill(JOB_CATEGORIES, job.category)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate max-w-[160px]">{job.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {timeAgo(job.createdAt)}
        </div>
      </div>

      {(job.salaryMin || job.salaryMax) && (
        <p className="mt-2 text-sm font-semibold text-energyGreen-700">
          {formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod)}
        </p>
      )}
    </Link>
  )
}
