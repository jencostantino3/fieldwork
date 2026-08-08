import { Flame } from 'lucide-react'

export default function RapidFillBadge({ size = 'sm' }) {
  if (size === 'lg') {
    return (
      <div className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-rapidFill px-3 py-1.5 rounded-full">
        <Flame className="w-4 h-4" /> RAPID FILL
      </div>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-rapidFill px-2 py-0.5 rounded-full">
      <Flame className="w-3 h-3" /> RAPID FILL
    </span>
  )
}
