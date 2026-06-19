import { useState } from 'react'
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react'
import { SPORTS, JOB_TYPES, JOB_CATEGORIES, RADIUS_OPTIONS } from '@/utils/constants'
import Button from '@/components/common/Button'
import { useGeolocation } from '@/hooks/useGeolocation'

export default function JobFilters({ filters, onChange }) {
  const [zipInput, setZipInput]     = useState(filters.zip || '')
  const [showMobile, setShowMobile] = useState(false)
  const { lookupZip, loading: geoLoading } = useGeolocation()

  function set(key, val) {
    onChange({ ...filters, [key]: val === filters[key] ? '' : val })
  }

  async function handleZipSearch() {
    if (zipInput.length !== 5) return
    const coords = await lookupZip(zipInput)
    if (coords) onChange({ ...filters, zip: zipInput, coords })
  }

  function clearAll() {
    setZipInput('')
    onChange({ sport: '', jobType: '', category: '', zip: '', coords: null, radius: 25, onlyUrgent: false })
  }

  const activeCount = [filters.sport, filters.jobType, filters.category, filters.zip, filters.onlyUrgent]
    .filter(Boolean).length

  const FilterPanel = () => (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sport</p>
        <div className="flex flex-wrap gap-2">
          {SPORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => set('sport', s.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filters.sport === s.value
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Job Type</p>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => set('jobType', t.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filters.jobType === t.value
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</p>
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
        >
          <option value="">All Categories</option>
          {JOB_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ZIP code"
              maxLength={5}
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleZipSearch()}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
            />
          </div>
          <Button size="sm" onClick={handleZipSearch} loading={geoLoading} variant="secondary">
            <Search className="w-4 h-4" />
          </Button>
        </div>
        {filters.zip && (
          <div className="mt-2">
            <select
              value={filters.radius}
              onChange={(e) => onChange({ ...filters, radius: Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={!!filters.onlyUrgent}
          onChange={(e) => onChange({ ...filters, onlyUrgent: e.target.checked })}
          className="w-4 h-4 accent-urgent rounded"
        />
        <span className="text-sm font-medium text-gray-700">Urgent / Last-Minute Only</span>
      </label>

      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" /> Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobile(!showMobile)}
          className="flex items-center gap-2 text-sm font-medium bg-white border border-gray-200 px-4 py-2.5 rounded-lg shadow-sm w-full"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters {activeCount > 0 && <span className="ml-auto bg-brand-navy text-white text-xs px-2 py-0.5 rounded-full">{activeCount}</span>}
        </button>
        {showMobile && (
          <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 shadow-card">
            <FilterPanel />
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block bg-white border border-gray-200 rounded-xl p-5 shadow-card sticky top-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {activeCount > 0 && (
            <span className="bg-brand-navy text-white text-xs px-2 py-0.5 rounded-full">{activeCount}</span>
          )}
        </div>
        <FilterPanel />
      </div>
    </>
  )
}
