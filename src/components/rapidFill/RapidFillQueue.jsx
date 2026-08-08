import { useEffect, useState } from 'react'
import { User, CheckCircle, Clock, Flame } from 'lucide-react'
import { subscribeToJobHolds, confirmRapidFillWorker } from '@/services/rapidFillService'
import Button from '@/components/common/Button'

function countdown(expiresAt) {
  if (!expiresAt) return ''
  const ms = expiresAt.toDate().getTime() - Date.now()
  if (ms <= 0) return 'expiring…'
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return `${min}:${String(sec).padStart(2, '0')}`
}

export default function RapidFillQueue({ job, onConfirmed }) {
  const [holds, setHolds]        = useState([])
  const [confirming, setConfirm] = useState(null)
  const [, setTick]              = useState(0)

  useEffect(() => {
    if (!job?.id) return
    return subscribeToJobHolds(job.id, setHolds)
  }, [job?.id])

  // Refresh countdown every second while holds are pending
  useEffect(() => {
    if (holds.length === 0) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [holds.length])

  async function handleConfirm(hold) {
    if (!confirm(`Confirm ${hold.workerName} for "${job.title}"? All other pending holds will be released.`)) return
    setConfirm(hold.id)
    try {
      await confirmRapidFillWorker(hold.id, job.id)
      onConfirmed?.()
    } catch (e) {
      alert(e.message)
    } finally {
      setConfirm(null)
    }
  }

  if (holds.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
        <Flame className="w-8 h-8 text-rapidFill mx-auto mb-2 opacity-40" />
        <p className="text-gray-500 text-sm font-medium">No workers in queue yet</p>
        <p className="text-gray-400 text-xs mt-1">Workers can tap "I'm Available Now" on this listing.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {holds.map((hold) => (
        <div
          key={hold.id}
          className="flex items-center gap-3 bg-rapidFill-50 border border-rapidFill-200 rounded-xl px-4 py-3"
        >
          <div className="w-9 h-9 rounded-full bg-rapidFill-100 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-rapidFill-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{hold.workerName}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3 shrink-0" />
              {countdown(hold.expiresAt)} remaining
            </p>
          </div>
          <Button
            variant="rapidFill"
            size="sm"
            loading={confirming === hold.id}
            onClick={() => handleConfirm(hold)}
          >
            <CheckCircle className="w-3.5 h-3.5" /> Confirm
          </Button>
        </div>
      ))}
    </div>
  )
}
