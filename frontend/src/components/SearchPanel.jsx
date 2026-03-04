import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Search, ChevronRight, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SelectBox = ({ label, value, onChange, options, disabled, loading, placeholder }) => (
  <div className="flex-1 min-w-[160px]">
    <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">
      {label}
    </label>
    <div className="relative">
      {loading && (
        <Loader2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent animate-spin z-10" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className={`
          w-full bg-surface-card border border-surface-border rounded-lg
          px-3 py-2.5 text-sm font-medium text-white
          focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-150
          ${loading ? 'pl-8' : ''}
        `}
      >
        <option value="">{placeholder || `Select ${label}`}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
)

export default function SearchPanel({ onCarSelected }) {
  const [makes, setMakes]   = useState([])
  const [models, setModels] = useState([])
  const [years, setYears]   = useState([])
  const [trims, setTrims]   = useState([])

  const [make, setMake]   = useState('')
  const [model, setModel] = useState('')
  const [year, setYear]   = useState('')
  const [trim, setTrim]   = useState('')

  const [loadingMakes,  setLoadingMakes]  = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingYears,  setLoadingYears]  = useState(false)
  const [loadingTrims,  setLoadingTrims]  = useState(false)
  const [searching,     setSearching]     = useState(false)
  const [error, setError] = useState(null)

  // Load makes on mount
  useEffect(() => {
    axios.get('/api/makes')
      .then((r) => setMakes(r.data))
      .catch(() => setError('Failed to load makes. Is the backend running?'))
      .finally(() => setLoadingMakes(false))
  }, [])

  // When make changes → load models
  useEffect(() => {
    if (!make) { setModels([]); setModel(''); setYears([]); setYear(''); setTrims([]); setTrim(''); return }
    setLoadingModels(true)
    setModels([])
    setModel('')
    setYears([])
    setYear('')
    setTrims([])
    setTrim('')
    axios.get(`/api/models/${encodeURIComponent(make)}`)
      .then((r) => setModels(r.data))
      .finally(() => setLoadingModels(false))
  }, [make])

  // When model changes → load years
  useEffect(() => {
    if (!make || !model) { setYears([]); setYear(''); setTrims([]); setTrim(''); return }
    setLoadingYears(true)
    setYears([])
    setYear('')
    setTrims([])
    setTrim('')
    axios.get(`/api/years/${encodeURIComponent(make)}/${encodeURIComponent(model)}`)
      .then((r) => setYears(r.data))
      .finally(() => setLoadingYears(false))
  }, [model])

  // When year changes → load trims
  useEffect(() => {
    if (!make || !model || !year) { setTrims([]); setTrim(''); return }
    setLoadingTrims(true)
    setTrims([])
    setTrim('')
    axios.get(`/api/trims/${encodeURIComponent(make)}/${encodeURIComponent(model)}/${encodeURIComponent(year)}`)
      .then((r) => setTrims(r.data))
      .catch(() => {})
      .finally(() => setLoadingTrims(false))
  }, [year])

  const handleSearch = useCallback(async () => {
    if (!make || !model || !year) return
    setSearching(true)
    setError(null)

    // Pick selected trim or fall back to first
    const selectedTrim = trim
      ? trims.find((t) => t.model_id === trim) || trims[0]
      : trims[0]

    if (!selectedTrim) {
      setError('No data found for this selection.')
      setSearching(false)
      return
    }

    onCarSelected({ trim: selectedTrim })
    setSearching(false)
  }, [make, model, year, trim, trims, onCarSelected])

  const canSearch = make && model && year && trims.length > 0

  return (
    <section className="bg-surface-card border-b border-surface-border px-6 py-5">
      {error && (
        <div className="mb-4 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-end">
        <SelectBox
          label="Make"
          value={make}
          onChange={setMake}
          options={makes.map((m) => ({ value: m.make_id, label: m.make_display }))}
          loading={loadingMakes}
          placeholder="Any Make"
        />
        <ChevronRight size={16} className="text-surface-border self-center mt-5 hidden sm:block" />
        <SelectBox
          label="Model"
          value={model}
          onChange={setModel}
          options={models.map((m) => ({ value: m.model_name, label: m.model_name }))}
          disabled={!make}
          loading={loadingModels}
          placeholder={make ? 'Select Model' : '—'}
        />
        <ChevronRight size={16} className="text-surface-border self-center mt-5 hidden sm:block" />
        <SelectBox
          label="Year"
          value={year}
          onChange={setYear}
          options={years.map((y) => ({ value: y, label: y }))}
          disabled={!model}
          loading={loadingYears}
          placeholder={model ? 'Select Year' : '—'}
        />

        <AnimatePresence>
          {trims.length > 1 && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <>
                <ChevronRight size={16} className="text-surface-border self-center mt-5 hidden sm:block" />
                <SelectBox
                  label="Trim"
                  value={trim}
                  onChange={setTrim}
                  options={trims.map((t) => ({
                    value: t.model_id,
                    label: t.model_trim || 'Base',
                  }))}
                  loading={loadingTrims}
                  placeholder="Any Trim"
                />
              </>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={!canSearch || searching}
          className="
            flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm
            bg-accent text-white shadow-glow-sm
            hover:bg-accent/90 active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
            transition-all duration-150 self-end mt-5 sm:mt-0
          "
        >
          {searching ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
          {searching ? 'Loading...' : 'Search'}
        </button>
      </div>
    </section>
  )
}
