import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Sparkles, Mail, Star } from 'lucide-react'
import { clsx } from 'clsx'
import { timeAgo } from '@/utils/helpers'
import { updateApplicationStatus } from '@/services/applicationService'
import { formatRating } from '@/services/ratingService'
import BadgeDisplay from '@/components/badges/BadgeDisplay'
import Button from '@/components/common/Button'

const STATUS_STYLES = {
  pending:  'bg-gray-100 text-gray-600',
  reviewed: 'bg-blue-50 text-blue-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
}

export default function ApplicantCard({ application, applicantProfile, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading]   = useState(false)

  async function setStatus(status) {
    setLoading(true)
    try {
      await updateApplicationStatus(application.id, status)
      onStatusChange?.(application.id, status)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-10 rounded-full bg-athleticBlue-50 border border-athleticBlue-100 flex items-center justify-center text-sm font-bold text-navy shrink-0">
          {(applicantProfile?.name || '?').charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {applicantProfile?.name ?? 'Applicant'}
          </p>
          <p className="text-xs text-gray-500">{timeAgo(application.appliedAt)}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {application.priority && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-energyGreen-700 bg-energyGreen-50 border border-energyGreen-200 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Priority
            </span>
          )}
          <span className={clsx('text-xs font-medium px-2 py-1 rounded-full capitalize', STATUS_STYLES[application.status])}>
            {application.status}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">

          {/* Identity row */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-athleticBlue-50 border-2 border-athleticBlue-100 flex items-center justify-center text-lg font-bold text-navy shrink-0">
              {(applicantProfile?.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{applicantProfile?.name ?? 'Unknown applicant'}</p>
              {applicantProfile?.email && (
                <a
                  href={`mailto:${applicantProfile.email}`}
                  className="inline-flex items-center gap-1 text-xs text-athleticBlue hover:underline mt-0.5"
                >
                  <Mail className="w-3 h-3" /> {applicantProfile.email}
                </a>
              )}
              {(() => {
                const rating = formatRating(applicantProfile?.ratingStats)
                return rating ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-semibold text-gray-800">{rating.average.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({rating.count} {rating.count === 1 ? 'rating' : 'ratings'})</span>
                  </div>
                ) : null
              })()}
            </div>
          </div>

          {/* Credentials */}
          {applicantProfile?.badges?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Credentials</p>
              <BadgeDisplay badges={applicantProfile.badges} size="sm" />
            </div>
          )}

          {/* Application answers */}
          {(application.answers || []).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Application Answers</p>
              <div className="space-y-3">
                {application.answers.map((a, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-gray-700">{a.question}</p>
                    <p className="text-sm text-gray-600 mt-0.5 bg-gray-50 rounded-lg px-3 py-2">{a.answer || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No profile or answers yet */}
          {!applicantProfile && (application.answers || []).length === 0 && (
            <p className="text-sm text-gray-400 italic">No additional profile information available.</p>
          )}

          {/* Actions */}
          {application.status === 'pending' || application.status === 'reviewed' ? (
            <div className="flex gap-2 pt-1 flex-wrap">
              <Button size="sm" variant="field" onClick={() => setStatus('accepted')} loading={loading}>
                <CheckCircle className="w-4 h-4" /> Accept
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setStatus('reviewed')} loading={loading}>
                <Clock className="w-4 h-4" /> Mark Reviewed
              </Button>
              <Button size="sm" variant="danger" onClick={() => setStatus('rejected')} loading={loading}>
                <XCircle className="w-4 h-4" /> Decline
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic capitalize">Status: {application.status}</p>
          )}
        </div>
      )}
    </div>
  )
}
