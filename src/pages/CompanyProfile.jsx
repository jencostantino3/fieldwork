import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Globe, MapPin } from 'lucide-react'
import { getCompany } from '@/services/companyService'
import { fetchJobs } from '@/services/jobService'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import JobCard from '@/components/jobs/JobCard'

export default function CompanyProfile() {
  const { id }          = useParams()
  const [company, setCompany] = useState(null)
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [c, allJobs] = await Promise.all([
        getCompany(id),
        fetchJobs({}),
      ])
      setCompany(c)
      setJobs(allJobs.filter((j) => j.companyId === id))
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <LoadingSpinner size="lg" className="mt-32" />
  if (!company) return <div className="text-center py-20 text-gray-500">Organization not found.</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-card">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-3xl font-bold text-brand-navy shrink-0">
            {company.logoUrl
              ? <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover rounded-2xl" />
              : company.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              {company.verified && (
                <CheckCircle className="w-5 h-5 text-field" title="Verified Organization" />
              )}
            </div>
            <p className="text-gray-600 capitalize mt-0.5">{company.sport}</p>
            {company.location && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" /> {company.location}
              </p>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-navy flex items-center gap-1 mt-1 hover:underline"
              >
                <Globe className="w-3.5 h-3.5" /> {company.website}
              </a>
            )}
          </div>
        </div>

        {company.description && (
          <p className="mt-6 text-gray-700 leading-relaxed text-sm">{company.description}</p>
        )}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Open Positions ({jobs.length})
      </h2>
      {jobs.length === 0 ? (
        <p className="text-gray-500 text-sm bg-white rounded-xl border border-gray-200 p-8 text-center">
          No open positions right now. Check back soon.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {jobs.map((j) => <JobCard key={j.id} job={j} />)}
        </div>
      )}
    </div>
  )
}
