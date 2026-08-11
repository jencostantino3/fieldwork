import { useState } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, Camera, Phone, X } from 'lucide-react'

export const DEFAULT_TASKS = [
  { label: 'Arrive on time / check in with site contact', requiresPhoto: false },
  { label: 'Setup and equipment ready',                   requiresPhoto: false },
  { label: 'All participants checked in',                 requiresPhoto: false },
  { label: 'Confirm wrap-up / cleanup complete',          requiresPhoto: false },
]

function makeTask(label = '', requiresPhoto = false, order = 0) {
  return {
    taskId:       `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label,
    requiresPhoto,
    order,
  }
}

export function buildDefaultTasks() {
  return DEFAULT_TASKS.map((t, i) => makeTask(t.label, t.requiresPhoto, i))
}

export default function ChecklistBuilder({ tasks, onTasksChange, notifyNumbers, onNumbersChange }) {
  const [newLabel,  setNewLabel]  = useState('')
  const [newNumber, setNewNumber] = useState('')

  function updateTask(index, updates) {
    onTasksChange(tasks.map((t, i) => (i === index ? { ...t, ...updates } : t)))
  }

  function removeTask(index) {
    onTasksChange(tasks.filter((_, i) => i !== index))
  }

  function moveTask(index, direction) {
    const next = [...tasks]
    const swap = index + direction
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    onTasksChange(next.map((t, i) => ({ ...t, order: i })))
  }

  function addTask() {
    const label = newLabel.trim()
    if (!label) return
    onTasksChange([...tasks, makeTask(label, false, tasks.length)])
    setNewLabel('')
  }

  function addNumber() {
    const num = newNumber.trim()
    if (!num || notifyNumbers.includes(num)) return
    onNumbersChange([...notifyNumbers, num])
    setNewNumber('')
  }

  return (
    <div className="space-y-4">
      {/* Task list */}
      <div className="space-y-2">
        {tasks.map((task, idx) => (
          <div key={task.taskId} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
            {/* Reorder */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button type="button" onClick={() => moveTask(idx, -1)} disabled={idx === 0}
                className="text-gray-300 hover:text-gray-600 disabled:opacity-30">
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => moveTask(idx, 1)} disabled={idx === tasks.length - 1}
                className="text-gray-300 hover:text-gray-600 disabled:opacity-30">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Label */}
            <input
              value={task.label}
              onChange={(e) => updateTask(idx, { label: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
              placeholder="Task description..."
            />

            {/* Photo toggle */}
            <button
              type="button"
              onClick={() => updateTask(idx, { requiresPhoto: !task.requiresPhoto })}
              title={task.requiresPhoto ? 'Photo required — click to remove' : 'Require photo proof'}
              className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                task.requiresPhoto
                  ? 'text-athleticBlue bg-athleticBlue-50'
                  : 'text-gray-300 hover:text-gray-500'
              }`}
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button type="button" onClick={() => removeTask(idx)}
              className="text-gray-300 hover:text-red-500 p-1.5 shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {tasks.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No tasks yet — add one below.</p>
        )}
      </div>

      {/* Add task input */}
      <div className="flex gap-2">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTask() } }}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
          placeholder="Add a task…"
        />
        <button
          type="button"
          onClick={addTask}
          disabled={!newLabel.trim()}
          className="px-4 py-2 bg-athleticBlue text-white text-sm font-medium rounded-xl hover:bg-athleticBlue-700 disabled:opacity-40 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Notify numbers */}
      <div className="border-t border-gray-100 pt-4">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
          <Phone className="w-3.5 h-3.5" /> Send task-completion texts to
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {notifyNumbers.map((num) => (
            <span key={num}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
              {num}
              <button type="button" onClick={() => onNumbersChange(notifyNumbers.filter((n) => n !== num))}
                className="text-gray-400 hover:text-red-500 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNumber() } }}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-athleticBlue"
            placeholder="+15550001234"
          />
          <button
            type="button"
            onClick={addNumber}
            disabled={!newNumber.trim()}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 disabled:opacity-40"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          All numbers on this list get a text whenever a worker completes a task.
        </p>
      </div>
    </div>
  )
}
