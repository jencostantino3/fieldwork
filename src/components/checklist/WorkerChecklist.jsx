import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Camera, Loader2, Upload } from 'lucide-react'
import {
  getOrCreateChecklistResponse, updateChecklistTasks, uploadTaskPhoto,
} from '@/services/checklistService'
import { useAuth } from '@/contexts/AuthContext'

export default function WorkerChecklist({ job }) {
  const { user, profile } = useAuth()
  const [response, setResponse] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(null) // taskId currently in-flight
  const [error,    setError]    = useState('')

  const template = job?.checklistTemplate

  useEffect(() => {
    if (!user || !template?.tasks?.length) { setLoading(false); return }
    getOrCreateChecklistResponse(
      job.id, user.uid, profile?.name || '', job.employerId, template.tasks
    )
      .then(setResponse)
      .catch(() => setError('Could not load checklist.'))
      .finally(() => setLoading(false))
  }, [job?.id, user?.uid])

  async function toggleTask(taskId) {
    if (!response) return
    const task = response.tasks.find((t) => t.taskId === taskId)
    if (!task) return
    // Tasks that require a photo must be completed via upload, not tap
    if (task.requiresPhoto && !task.completed && !task.photoUrl) return

    setSaving(taskId)
    const updatedTasks = response.tasks.map((t) =>
      t.taskId === taskId
        ? {
            ...t,
            completed:   !t.completed,
            completedAt: !t.completed ? new Date().toISOString() : null,
          }
        : t
    )
    try {
      await updateChecklistTasks(response.id, updatedTasks)
      setResponse((prev) => ({ ...prev, tasks: updatedTasks }))
    } catch {
      setError('Could not save — please try again.')
    } finally {
      setSaving(null)
    }
  }

  async function handlePhotoUpload(taskId, file) {
    if (!file || !response) return
    setSaving(taskId)
    setError('')
    try {
      const url = await uploadTaskPhoto(job.id, response.id, taskId, file)
      const updatedTasks = response.tasks.map((t) =>
        t.taskId === taskId
          ? { ...t, photoUrl: url, completed: true, completedAt: new Date().toISOString() }
          : t
      )
      await updateChecklistTasks(response.id, updatedTasks)
      setResponse((prev) => ({ ...prev, tasks: updatedTasks }))
    } catch {
      setError('Could not upload photo — please try again.')
    } finally {
      setSaving(null)
    }
  }

  if (!template) {
    return <p className="py-10 text-center text-gray-400 text-sm">No checklist for this event.</p>
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    )
  }

  const tasks     = response?.tasks ?? []
  const completed = tasks.filter((t) => t.completed).length
  const total     = tasks.length
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-medium text-gray-700">{completed} of {total} complete</span>
          <span className="text-gray-400">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-energyGreen rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Task list */}
      <div className="space-y-2">
        {tasks.map((task) => {
          const isSaving     = saving === task.taskId
          const needsPhoto   = task.requiresPhoto && !task.photoUrl && !task.completed
          const isClickable  = !isSaving && !needsPhoto

          return (
            <div
              key={task.taskId}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                task.completed
                  ? 'bg-energyGreen-50 border-energyGreen-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Check button */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => toggleTask(task.taskId)}
                className="mt-0.5 shrink-0"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-energyGreen" />
                ) : (
                  <Circle className={`w-5 h-5 ${needsPhoto ? 'text-gray-200' : 'text-gray-300 hover:text-gray-500 cursor-pointer'}`} />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.label}
                </p>

                {/* Photo section */}
                {task.requiresPhoto && (
                  <div className="mt-2">
                    {task.photoUrl ? (
                      <a
                        href={task.photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-athleticBlue hover:underline"
                      >
                        <Camera className="w-3.5 h-3.5" /> View uploaded photo
                      </a>
                    ) : (
                      <label className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors bg-athleticBlue-50 text-athleticBlue hover:bg-athleticBlue-100 ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload className="w-3.5 h-3.5" />
                        {isSaving ? 'Uploading…' : 'Upload photo to complete'}
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(task.taskId, e.target.files?.[0])}
                        />
                      </label>
                    )}
                  </div>
                )}

                {task.completedAt && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Completed at {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
