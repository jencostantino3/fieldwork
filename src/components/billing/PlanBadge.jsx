import { Sparkles } from 'lucide-react'
import { PLANS } from '@/utils/constants'
import clsx from 'clsx'

const CONFIG = {
  [PLANS.EMPLOYER_PRO]: { label: 'Employer Pro', className: 'bg-athleticBlue-50 text-navy border-athleticBlue-200' },
  [PLANS.WORKER_PRO]:   { label: 'Worker Pro',   className: 'bg-energyGreen-50  text-energyGreen-700  border-energyGreen-200'  },
  [PLANS.FREE]:         { label: 'Free',          className: 'bg-gray-50   text-gray-500   border-gray-200'   },
}

export default function PlanBadge({ plan = PLANS.FREE, className }) {
  const cfg = CONFIG[plan] ?? CONFIG[PLANS.FREE]
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border',
        cfg.className,
        className
      )}
    >
      {plan !== PLANS.FREE && <Sparkles className="w-3 h-3" />}
      {cfg.label}
    </span>
  )
}
