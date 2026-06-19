import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, Zap, ShieldCheck, Award, Briefcase, ChevronRight, Info } from 'lucide-react'
import Button from '@/components/common/Button'
import { SPORTS, JOB_CATEGORIES } from '@/utils/constants'

const IS_DEMO = !import.meta.env.VITE_FIREBASE_API_KEY

const STATS = [
  { label: 'Active Jobs',      value: '500+' },
  { label: 'Organizations',    value: '120+' },
  { label: 'Sports Covered',   value: '3' },
  { label: 'Workers Placed',   value: '1,200+' },
]

const FEATURES = [
  {
    icon: Briefcase,
    title: 'No Resume Required',
    desc: 'Apply by answering a few sport-specific questions — no uploading PDFs or formatting headaches.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Credentials',
    desc: 'Badge system for CORI, SafeSport, CPR, coaching certs — employers see your clearances at a glance.',
  },
  {
    icon: Zap,
    title: 'Urgent Boost',
    desc: 'Employers can ping nearby qualified workers for same-day or next-day gigs.',
  },
  {
    icon: Award,
    title: 'Sports-First',
    desc: 'Built for the realities of coaching, officiating, athletic training, and game-day ops.',
  },
]

export default function Home() {
  const [zip, setZip]     = useState('')
  const navigate          = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    const params = zip ? `?zip=${zip}` : ''
    navigate(`/jobs${params}`)
  }

  return (
    <div className="min-h-screen">
      {IS_DEMO && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-center gap-2 text-sm text-amber-800">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            <strong>Demo mode</strong> — Firebase not connected. Copy <code className="bg-amber-100 px-1 rounded">.env.example</code> to <code className="bg-amber-100 px-1 rounded">.env</code> and add your Firebase credentials to enable auth and data.
          </span>
        </div>
      )}

      {/* Hero */}
      <section className="bg-brand-navy relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg, transparent, transparent 40px, rgba(255,255,255,.3) 40px, rgba(255,255,255,.3) 41px
            ), repeating-linear-gradient(
              90deg, transparent, transparent 40px, rgba(255,255,255,.3) 40px, rgba(255,255,255,.3) 41px
            )`,
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-field/20 border border-field/30 text-field-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" /> Now hiring for baseball, basketball & softball
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-5 leading-tight">
            Sports Jobs.<br />
            <span className="text-field-400">No Resume Needed.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            FieldWork connects coaches, umpires, trainers, and operations staff with the leagues,
            schools, and organizations that need them — fast.
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter your ZIP code"
                maxLength={5}
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-3 focus:ring-field shadow-lg"
              />
            </div>
            <Button size="lg" variant="field" type="submit" className="whitespace-nowrap px-8">
              <Search className="w-5 h-5" /> Find Jobs
            </Button>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by sport */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse by Sport</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {SPORTS.map((s) => (
            <Link
              key={s.value}
              to={`/jobs?sport=${s.value}`}
              className="group relative bg-white border border-gray-200 rounded-2xl p-8 text-center hover:border-brand-navy hover:shadow-card-hover transition-all"
            >
              <div className="text-5xl mb-3">
                {s.value === 'baseball' ? '⚾' : s.value === 'basketball' ? '🏀' : '🥎'}
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-navy">{s.label}</h3>
              <p className="text-sm text-gray-500 mt-1">View open positions</p>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-navy absolute right-5 top-1/2 -translate-y-1/2 transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Built for the Sideline Economy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-card">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-brand-navy" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by category */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Role</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {JOB_CATEGORIES.map((c) => (
            <Link
              key={c.value}
              to={`/jobs?category=${c.value}`}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-navy hover:text-brand-navy transition-colors text-center"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Employer CTA */}
      <section className="bg-brand-navy py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Hiring for your organization?</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Post a job, review question-based applications, and boost urgent openings to nearby workers — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=employer">
              <Button size="lg" variant="field">Post a Job — Free</Button>
            </Link>
            <Link to="/companies">
              <Button size="lg" variant="secondary">Browse Organizations</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
