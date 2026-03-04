import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, Database, Globe, Smartphone } from 'lucide-react'
import Header from './components/Header'
import SearchPanel from './components/SearchPanel'
import ImageGallery from './components/ImageGallery'
import StatsPanel from './components/StatsPanel'

// ── Welcome / empty state ──────────────────────────────────────────────────────
const WelcomeScreen = () => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="flex flex-col items-center justify-center h-full gap-10 px-6 py-16 text-center"
  >
    <div className="relative">
      <div className="w-24 h-24 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center shadow-glow">
        <Car size={44} className="text-accent" />
      </div>
      <div className="absolute inset-0 rounded-2xl border border-accent/20 animate-ping" style={{ animationDuration: '2.5s' }} />
    </div>

    <div className="space-y-3 max-w-md">
      <h2 className="font-display text-3xl font-bold text-white tracking-wide">
        Every Car. Every Spec.
      </h2>
      <p className="text-slate-400 leading-relaxed">
        Browse thousands of vehicles from hundreds of manufacturers worldwide.
        Select a make, model, and year above to explore full specs, stats, and photos.
      </p>
    </div>

    <div className="flex flex-wrap justify-center gap-3">
      {[
        { icon: Database,   text: 'Full spec database'  },
        { icon: Globe,      text: 'Worldwide makes'     },
        { icon: Car,        text: 'Photo gallery'       },
        { icon: Smartphone, text: 'Mobile-ready design' },
      ].map(({ icon: Icon, text }) => (
        <div
          key={text}
          className="flex items-center gap-2 bg-surface-card border border-surface-border rounded-full px-4 py-2 text-sm text-slate-400"
        >
          <Icon size={14} className="text-accent" />
          {text}
        </div>
      ))}
    </div>
  </motion.div>
)

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [currentTrim,   setCurrentTrim]   = useState(null)
  const [allTrims,      setAllTrims]      = useState([])
  const [carImages,     setCarImages]     = useState([])
  const [imagesLoading, setImagesLoading] = useState(false)

  const handleCarSelected = useCallback(async ({ trim }) => {
    setCurrentTrim(trim)
    setCarImages([])
    setImagesLoading(true)

    const make  = trim.model_make_display || trim.model_make_id
    const model = trim.model_name
    const year  = trim.model_year || ''

    // Fetch photos and all trims in parallel
    await Promise.all([
      // ── Photo gallery ──
      fetch(`/api/car-images?${new URLSearchParams({ make, model, year })}`)
        .then((r) => r.ok ? r.json() : [])
        .then((data) => setCarImages(Array.isArray(data) ? data : []))
        .catch(() => setCarImages([]))
        .finally(() => setImagesLoading(false)),

      // ── Trim selector ──
      fetch(`/api/trims/${encodeURIComponent(trim.model_make_id)}/${encodeURIComponent(model)}/${encodeURIComponent(year)}`)
        .then((r) => r.ok ? r.json() : [trim])
        .then((data) => setAllTrims(Array.isArray(data) ? data : [trim]))
        .catch(() => setAllTrims([trim])),
    ])
  }, [])

  const carName = currentTrim
    ? [currentTrim.model_year, currentTrim.model_make_display, currentTrim.model_name]
        .filter(Boolean).join(' ')
    : null

  return (
    <div className="flex flex-col h-screen bg-surface-base bg-grid overflow-hidden">
      <Header />
      <SearchPanel onCarSelected={handleCarSelected} />

      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!currentTrim ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <WelcomeScreen />
            </motion.div>
          ) : (
            <motion.div
              key="car"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0"
            >
              {/* ── Left: photo gallery ── */}
              <div className="p-4 border-r border-surface-border flex flex-col min-h-[300px] lg:min-h-0">
                <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3 flex items-center gap-1.5">
                  <Car size={11} className="text-accent" />
                  {imagesLoading
                    ? 'Loading photos…'
                    : carImages.length > 0
                      ? `Photos · ${carImages.length} found`
                      : 'Photos'}
                </h3>
                <div className="flex-1">
                  <ImageGallery
                    images={carImages}
                    carName={carName}
                    loading={imagesLoading}
                  />
                </div>
              </div>

              {/* ── Right: stats panel ── */}
              <div className="p-4 overflow-y-auto">
                <StatsPanel
                  trim={currentTrim}
                  allTrims={allTrims}
                  onTrimChange={(newTrim) => setCurrentTrim(newTrim)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
