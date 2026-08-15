import { useState } from 'react'
import { Star } from 'lucide-react'
import { submitRating, skipRating } from '@/services/ratingService'
import { useAuth } from '@/contexts/AuthContext'

const TAGS = {
  employer: ['Unclear instructions', 'Poor communication', 'Unsafe conditions', 'Pay issue'],
  worker:   ['Late / no-show', 'Poor communication', 'Work quality issues', 'Unprofessional'],
}

export default function RatingModal({ open, toUid, jobId, ratedRole, ratedName, onDone }) {
  const { user } = useAuth()
  const [step,    setStep]    = useState('stars')
  const [stars,   setStars]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [tag,     setTag]     = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const tags = TAGS[ratedRole] ?? TAGS.worker

  async function doSubmit(s, t) {
    setLoading(true)
    try {
      await submitRating({ fromUid: user.uid, toUid, jobId, stars: s, tag: t || null, ratedRole })
    } catch (e) {
      console.warn('Rating submit failed:', e.message)
    } finally {
      setLoading(false)
      onDone()
    }
  }

  async function handleStarClick(n) {
    setStars(n)
    if (n === 5) {
      await doSubmit(n, '')
    } else {
      setStep('tag')
    }
  }

  async function handleSkip() {
    if (user?.uid) skipRating(user.uid, jobId).catch(() => {})
    onDone()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleSkip} />

      <div className="relative bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-xl z-10 p-6 text-center space-y-5">
        {step === 'stars' ? (
          <>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">
                Rate your experience
              </p>
              <h2 className="text-lg font-bold text-gray-900">
                How was {ratedName}?
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Your rating is anonymous — only the average is ever shown.
              </p>
            </div>

            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => handleStarClick(n)}
                  className="p-1.5 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      n <= (hovered || stars)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={handleSkip}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip for now
            </button>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">
                Optional — private
              </p>
              <h2 className="text-lg font-bold text-gray-900">What went wrong?</h2>
              <p className="text-xs text-gray-400 mt-1">Never shared with anyone.</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(tag === t ? '' : t)}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    tag === t
                      ? 'border-navy bg-navy text-white'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => doSubmit(stars, tag)}
                disabled={loading}
                className="flex-1 bg-energyGreen hover:bg-energyGreen-700 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors disabled:opacity-60"
              >
                {loading ? 'Submitting…' : 'Submit'}
              </button>
              <button
                onClick={() => doSubmit(stars, '')}
                disabled={loading}
                className="flex-1 border border-gray-200 text-gray-600 font-medium rounded-xl py-2.5 text-sm hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                Skip reason
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
