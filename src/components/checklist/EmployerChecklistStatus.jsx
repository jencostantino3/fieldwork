import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Loader2, Camera } from 'lucide-react'
import { subscribeToJobChecklistResponses } from '@/services/checklistService'

export default function EmployerChecklistStatus({ job }) {
  const [responses, setResponses] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!job?.id) return
    const unsub = subscribeToJobChecklistResponses(job.id, (data) => {
      setResponses(data)
      setLoading(false)
    })
    return unsub
  }, [job?.id])

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    )
  }

  if (responses.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-400 text-sm">
        No workers have opened their checklist yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {responses.map((r) => {
        const completed = r.tasks.filter((t) => t.completed).length
        const total     = r.tasks.length
        const pct       = total > 0 ? Math.round((completed / total) * 100) : 0

        return (
          <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-card">
            {/* Worker header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-800 truncate">
                {r.workerName || `Worker ${r.workerId.slice(0, 8)}…`}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                pct === 100
                  ? 'bg-energyGreen-50 text-energyGreen-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {completed}/{total} · {pct}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-energyGreen rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Task rows */}
            <div className="space-y-1.5">
              {r.tasks.map((task) => (
                <div key={task.taskId} className="flex items-center gap-2 text-sm">
                  {task.completed
                    ? <CheckCircle2 className="w-4 h-4 text-energyGreen shrink-0" />
                    : <Circle       className="w-4 h-4 text-gray-300 shrink-0" />
                  }
                  <span className={`flex-1 min-w-0 truncate ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {task.label}
                  </span>
                  {task.photoUrl && (
                    <a href={task.photoUrl} target="_blank" rel="noreferrer"
                      className="text-athleticBlue hover:opacity-70 shrink-0" title="View photo">
                      <Camera className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {task.completedAt && (
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
