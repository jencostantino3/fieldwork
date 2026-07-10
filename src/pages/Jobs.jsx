import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import JobCard from '@/components/jobs/JobCard'
import JobFilters from '@/components/jobs/JobFilters'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { fetchJobs } from '@/services/jobService'
import { getCoordinatesFromZip } from '@/utils/helpers'
import { useAuth } from '@/contexts/AuthContext'
import { Briefcase, Sparkles } from 'lucide-react'

const EARLY_ACCESS_HOURS = 24

export default function Jobs() {
  const [searchParams] = useSearchParams()
  const { isWorker, isWorkerPro } = useAuth()
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    sport:       searchParams.get('sport') || '',
    jobType:     searchParams.get('jobType') || '',
    category:    searchParams.get('category') || '',
    zip:         searchParams.get('zip') || '',
    coords:      null,
    radius:      25,
    onlyUrgent:  false,
  })

  useEffect(() => {
    if (filters.zip && !filters.coords) {
      getCoordinatesFromZip(filters.zip).then((coords) => {
        if (coords) setFilters((f) => ({ ...f, coords }))
      })
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchJobs({
      sport:       filters.sport    || undefined,
      jobType:     filters.jobType  || undefined,
      category:    filters.category || undefined,
      coords:      filters.coords   || undefined,
      radiusMiles: filters.coords   ? filters.radius : undefined,
      onlyUrgent:  filters.onlyUrgent,
    })
      .then((allJobs) => {
        // Free workers miss the first 24 hours of new listings
        if (isWorker && !isWorkerPro) {
          const cutoff = new Date(Date.now() - EARLY_ACCESS_HOURS * 60 * 60 * 1000)
          return allJobs.filter((j) => {
            const ts = j.createdAt?.toDate ? j.createdAt.toDate() : new Date(j.createdAt)
            return ts < cutoff
          })
        }
        return allJobs
      })
      .then(setJobs)
      .finally(() => setLoading(false))
  }, [filters, isWorker, isWorkerPro])

  const urgentJobs  = jobs.filter((j) => j.urgent)
  const regularJobs = jobs.filter((j) => !j.urgent)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Find Sports Jobs</h1>
        {!loading && (
          <p className="text-gray-500 mt-1">
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
            {filters.zip && ` near ${filters.zip}`}
          </p>
        )}
      </div>

      {/* Worker Pro upsell for free workers */}
      {isWorker && !isWorkerPro && (
        <div className="mb-5 flex items-center gap-3 bg-field-50 border border-field-200 rounded-xl px-4 py-3">
          <Sparkles className="w-4 h-4 text-field shrink-0" />
          <p className="text-sm text-field-800 flex-1">
            <strong>Worker Pro</strong> — get 24hr early access to new listings, priority placement, and a Pro badge for $7.99/mo.
          </p>
          <Link to="/pricing?tab=worker" className="text-xs font-semibold text-field-700 hover:underline shrink-0">
            Upgrade
          </Link>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[280px_1fr] gap-6">
        <aside>
          <JobFilters filters={filters} onChange={setFilters} />
        </aside>

        <main>
          {loading ? (
            <LoadingSpinner size="lg" className="py-20" />
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700">No jobs found</h3>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or expanding your radius.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {urgentJobs.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-urgent uppercase tracking-widest mb-3 flex items-center gap-1">
                    ⚡ Urgent / Last-Minute
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {urgentJobs.map((job) => <JobCard key={job.id} job={job} />)}
                  </div>
                </div>
              )}

              {regularJobs.length > 0 && (
                <div>
                  {urgentJobs.length > 0 && (
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                      All Jobs
                    </h2>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {regularJobs.map((job) => <JobCard key={job.id} job={job} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
