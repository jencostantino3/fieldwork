import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { MessageSquare, X } from 'lucide-react'
import { db } from '@/firebase'
import { useAuth } from '@/contexts/AuthContext'

const VISIBLE_MS = 8000

export default function DemoMessagePreview() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])

  useEffect(() => {
    // demoMessages requires isSignedIn() per firestore.rules -- subscribing while
    // logged out threw a permission-denied console error on every public page.
    if (import.meta.env.VITE_DEMO_MODE !== 'true' || !db || !user) {
      setMessages([])
      return
    }
    const q = query(collection(db, 'demoMessages'), orderBy('createdAt', 'desc'), limit(5))
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }, [user])

  function dismiss(id) {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  // Auto-dismiss each bubble after a while so the stack doesn't grow unbounded during a demo.
  useEffect(() => {
    if (!messages.length) return
    const timers = messages.map((m) => setTimeout(() => dismiss(m.id), VISIBLE_MS))
    return () => timers.forEach(clearTimeout)
  }, [messages])

  if (import.meta.env.VITE_DEMO_MODE !== 'true' || messages.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-72 max-w-[90vw]">
      {messages.map((m) => (
        <div
          key={m.id}
          className="bg-white border border-gray-200 rounded-2xl shadow-lg p-3 flex items-start gap-2 animate-in"
        >
          <div className="w-7 h-7 rounded-full bg-energyGreen-50 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-energyGreen" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
              Simulated text{m.to ? ` to ${m.to}` : ''}
            </p>
            <p className="text-xs text-gray-800 leading-snug mt-0.5">{m.body}</p>
          </div>
          <button onClick={() => dismiss(m.id)} className="text-gray-300 hover:text-gray-500 shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
