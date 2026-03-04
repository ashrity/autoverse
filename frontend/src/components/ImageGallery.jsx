import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ImageOff, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react'

// ── Checkered tile pattern shown behind transparent PNGs ──────────────────────
const CheckerBg = () => (
  <div
    className="absolute inset-0 opacity-20"
    style={{
      backgroundImage:
        'linear-gradient(45deg,#555 25%,transparent 25%),' +
        'linear-gradient(-45deg,#555 25%,transparent 25%),' +
        'linear-gradient(45deg,transparent 75%,#555 75%),' +
        'linear-gradient(-45deg,transparent 75%,#555 75%)',
      backgroundSize: '16px 16px',
      backgroundPosition: '0 0,0 8px,8px -8px,-8px 0',
    }}
  />
)

// ── Individual image with its own loading / error state ───────────────────────
function GalleryImage({ src, alt, isPng, onError }) {
  const [status, setStatus] = useState('loading') // loading | loaded | error

  useEffect(() => {
    setStatus('loading')
    const img = new window.Image()
    img.src = src
    img.onload  = () => setStatus('loaded')
    img.onerror = () => { setStatus('error'); onError?.() }
    return () => { img.onload = null; img.onerror = null }
  }, [src])

  if (status === 'error') return null

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {isPng && <CheckerBg />}

      {/* Spinner while loading */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader2 size={32} className="text-accent animate-spin" />
        </div>
      )}

      <motion.img
        key={src}
        src={src}
        alt={alt}
        initial={{ opacity: 0 }}
        animate={{ opacity: status === 'loaded' ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-full max-h-full object-contain select-none"
        draggable={false}
      />
    </div>
  )
}

// ── Thumbnail strip ────────────────────────────────────────────────────────────
function Thumbnail({ img, active, onClick }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (failed) return null

  return (
    <button
      onClick={onClick}
      className={`
        relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-150
        ${active
          ? 'border-accent shadow-glow-sm scale-105'
          : 'border-surface-border hover:border-slate-500 opacity-60 hover:opacity-100'}
      `}
    >
      {img.mime === 'image/png' && <CheckerBg />}
      {!loaded && (
        <div className="absolute inset-0 bg-surface-raised flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-surface-border animate-pulse" />
        </div>
      )}
      <img
        src={img.url}
        alt={img.title}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className="relative z-10 w-full h-full object-contain"
      />
    </button>
  )
}

// ── Main Gallery component ─────────────────────────────────────────────────────
export default function ImageGallery({ images = [], carName, loading = false }) {
  const [idx,        setIdx]        = useState(0)
  const [failedUrls, setFailedUrls] = useState(new Set())

  // Reset index whenever the car changes
  useEffect(() => { setIdx(0); setFailedUrls(new Set()) }, [images])

  const visible = images.filter((img) => !failedUrls.has(img.url))

  const prev = useCallback(() => setIdx((i) => (i - 1 + visible.length) % visible.length), [visible.length])
  const next = useCallback(() => setIdx((i) => (i + 1) % visible.length), [visible.length])

  // Keyboard navigation
  useEffect(() => {
    if (visible.length < 2) return
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next, visible.length])

  const markFailed = useCallback((url) => {
    setFailedUrls((prev) => new Set([...prev, url]))
    setIdx((i) => Math.min(i, Math.max(visible.length - 2, 0)))
  }, [visible.length])

  const current = visible[Math.min(idx, visible.length - 1)]

  // ── Loading state ──
  if (loading) {
    return (
      <div className="relative w-full h-full min-h-[320px] bg-surface-card rounded-xl border border-surface-border flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="text-accent animate-spin" />
        <p className="text-slate-500 text-sm">Searching for photos…</p>
      </div>
    )
  }

  // ── No images state ──
  if (!loading && visible.length === 0) {
    return (
      <div className="relative w-full h-full min-h-[320px] bg-surface-card rounded-xl border border-surface-border flex flex-col items-center justify-center gap-5 p-6 text-center">
        {/* Decorative rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[80, 140, 200].map((size) => (
            <div key={size} className="absolute rounded-full border border-slate-800"
                 style={{ width: size, height: size }} />
          ))}
        </div>

        <div className="relative z-10 w-16 h-16 rounded-2xl bg-surface-raised border border-surface-border flex items-center justify-center">
          <ImageOff size={28} className="text-slate-600" />
        </div>

        <div className="relative z-10 space-y-1.5">
          {carName && <p className="text-white font-semibold">{carName}</p>}
          <p className="text-slate-400 text-sm font-medium">No car model available</p>
          <p className="text-slate-600 text-xs max-w-[220px]">
            No photos were found for this vehicle on Wikimedia Commons.
          </p>
        </div>

        {carName && (
          <a
            href={`https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(carName)}&ns6=1`}
            target="_blank"
            rel="noreferrer"
            className="relative z-10 flex items-center gap-1.5 text-xs text-accent hover:underline"
          >
            Search on Wikimedia Commons <ExternalLink size={10} />
          </a>
        )}
      </div>
    )
  }

  const isPng = current?.mime === 'image/png'

  return (
    <div className="relative w-full h-full min-h-[320px] bg-surface-card rounded-xl border border-surface-border flex flex-col overflow-hidden">

      {/* ── Main image area ── */}
      <div className="relative flex-1 overflow-hidden bg-black/40">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.url}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 p-3"
            >
              <GalleryImage
                src={current.url}
                alt={current.title || carName}
                isPng={isPng}
                onError={() => markFailed(current.url)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prev / Next arrows — only when >1 image */}
        {visible.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Image count badge */}
        {visible.length > 1 && (
          <div className="absolute top-3 right-3 z-30 bg-black/60 backdrop-blur-sm rounded-md px-2 py-0.5 text-xs text-slate-300 font-medium">
            {idx + 1} / {visible.length}
          </div>
        )}

        {/* PNG badge */}
        {isPng && (
          <div className="absolute top-3 left-3 z-30 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-2 py-0.5 text-[10px] text-green-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            PNG · May be transparent
          </div>
        )}
      </div>

      {/* ── Bottom bar: thumbnails + attribution ── */}
      <div className="border-t border-surface-border bg-surface-raised px-3 py-2.5 flex items-center gap-3">
        {/* Thumbnail strip */}
        {visible.length > 1 && (
          <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
            {visible.map((img, i) => (
              <Thumbnail
                key={img.url}
                img={img}
                active={i === idx}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        )}

        {/* Attribution */}
        {current && (
          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0 ml-auto">
            <ImageIcon size={11} className="text-accent" />
            <span>{current.source}</span>
            {current.sourceUrl && (
              <a
                href={current.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline flex items-center gap-0.5"
                title={`View "${current.title}" on ${current.source}`}
              >
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
