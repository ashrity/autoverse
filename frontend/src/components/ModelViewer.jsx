import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Box, ExternalLink, Info, ImageOff, Image } from 'lucide-react'

export default function ModelViewer({ modelInfo, carName }) {
  const [frameLoaded, setFrameLoaded] = useState(false)
  const [imgError,    setImgError]    = useState(false)

  const has3D    = modelInfo?.found
  const hasPhoto = !has3D && modelInfo?.imageInfo?.found && !imgError
  const noVisual = !has3D && !hasPhoto

  const embedUrl = has3D
    ? `https://sketchfab.com/models/${modelInfo.model_id}/embed?autostart=1&ui_controls=1&ui_infos=0&ui_stop=0&ui_watermark=1&ui_watermark_link=0`
    : null

  return (
    <div className="relative w-full h-full min-h-[320px] bg-surface-card rounded-xl border border-surface-border overflow-hidden">
      <AnimatePresence mode="wait">

        {/* ── State 1: Sketchfab 3D embed ── */}
        {has3D && (
          <motion.div
            key="viewer-3d"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {!frameLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-card z-10">
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">Loading 3D model…</p>
              </div>
            )}
            <iframe
              key={embedUrl}
              title={`3D model — ${carName}`}
              src={embedUrl}
              allow="autoplay; fullscreen; xr-spatial-tracking"
              className="model-frame"
              onLoad={() => setFrameLoaded(true)}
            />
            {/* Model name badge */}
            {modelInfo.model_name && (
              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-md px-2.5 py-1 text-xs text-slate-300">
                <Info size={11} className="text-accent" />
                {modelInfo.model_name}
              </div>
            )}
          </motion.div>
        )}

        {/* ── State 2: 2D Wikipedia reference photo ── */}
        {hasPhoto && (
          <motion.div
            key="viewer-photo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col"
          >
            {/* Image */}
            <div className="flex-1 relative overflow-hidden">
              <img
                src={modelInfo.imageInfo.url}
                alt={carName}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain bg-black/30"
              />
            </div>

            {/* Footer bar */}
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-surface-raised border-t border-surface-border">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Image size={13} className="text-accent shrink-0" />
                <span className="font-medium text-white truncate">
                  {modelInfo.imageInfo.title || carName}
                </span>
                <span className="text-slate-600 shrink-0">· Wikipedia</span>
              </div>
              {modelInfo.imageInfo.page_url && (
                <a
                  href={modelInfo.imageInfo.page_url}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 flex items-center gap-1 text-[11px] text-accent hover:underline"
                >
                  View article <ExternalLink size={10} />
                </a>
              )}
            </div>

            {/* "2D photo" badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-md px-2.5 py-1 text-xs text-slate-300">
              <Image size={11} className="text-accent" />
              Reference photo
            </div>
          </motion.div>
        )}

        {/* ── State 3: No visual available ── */}
        {noVisual && (
          <motion.div
            key="no-visual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center"
          >
            {/* Subtle ring decoration */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[80, 140, 200].map((size) => (
                <div
                  key={size}
                  className="absolute rounded-full border border-slate-800"
                  style={{ width: size, height: size }}
                />
              ))}
            </div>

            <div className="relative z-10 w-16 h-16 rounded-2xl bg-surface-raised border border-surface-border flex items-center justify-center">
              <ImageOff size={28} className="text-slate-600" />
            </div>

            <div className="relative z-10 space-y-1.5">
              {carName ? (
                <>
                  <p className="text-white font-semibold">{carName}</p>
                  <p className="text-slate-500 text-sm">No model available</p>
                  <p className="text-slate-600 text-xs max-w-[220px]">
                    {modelInfo?.reason === 'no_key'
                      ? 'Configure a Sketchfab API key to enable 3D models.'
                      : 'No 3D model or reference photo was found for this vehicle.'}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Box size={16} />
                    <span className="font-medium text-sm">Visual Viewer</span>
                  </div>
                  <p className="text-slate-600 text-xs">
                    Select a car to load its 3D model or photo
                  </p>
                </>
              )}
            </div>

            {/* Helper links */}
            {carName && (
              <div className="relative z-10 flex flex-col items-center gap-2">
                {modelInfo?.reason === 'no_key' ? (
                  <a
                    href="https://sketchfab.com/settings/password-api"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-accent hover:underline"
                  >
                    Get a free Sketchfab API key <ExternalLink size={10} />
                  </a>
                ) : (
                  <a
                    href={`https://sketchfab.com/search?q=${encodeURIComponent(carName)}&type=models`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-accent hover:underline"
                  >
                    Search {carName} on Sketchfab <ExternalLink size={10} />
                  </a>
                )}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
