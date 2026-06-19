import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Building2, CheckCircle } from 'lucide-react'
import { getAllCompanies } from '@/services/companyService'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { SPORTS } from '@/utils/constants'

export default function Companies() {
  const [companies, setCompanies]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [sportFilter, setSport]     = useState('')

  useEffect(() => {
    getAllCompanies().then(setCompanies).finally(() => setLoading(false))
  }, [])

  const filtered = companies.filter((c) => {
    const matchName  = c.name.toLowerCase().includes(search.toLowerCase())
    const matchSport = !sportFilter || c.sport === sportFilter || (c.sports || []).includes(sportFilter)
    return matchName && matchSport
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Teams & Organizations</h1>
        <p className="text-gray-500 mt-1">Find sports organizations actively hiring on FieldWork.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
        </div>
        <select
          value={sportFilter}
          onChange={(e) => setSport(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
        >
          <option value="">All Sports</option>
          {SPORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold">No organizations found</p>
          <p className="text-sm mt-1">Be the first to register your organization.</p>
          <Link to="/register?role=employer" className="inline-block mt-4 text-brand-navy font-medium hover:underline">
            Sign up as an Employer →
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to={`/companies/${c.id}`}
              className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-brand-navy hover:shadow-card-hover transition-all shadow-card"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-xl font-bold text-brand-navy shrink-0">
                  {c.logoUrl
                    ? <img src={c.logoUrl} alt={c.name} className="w-full h-full object-cover rounded-xl" />
                    : c.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-navy truncate">{c.name}</h3>
                    {c.verified && <CheckCircle className="w-4 h-4 text-field shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 capitalize">{c.sport}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
              <p className="text-xs text-brand-navy font-medium mt-3">{c.jobCount || 0} open positions</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
