import { motion } from 'framer-motion'

// Accent colour → Tailwind classes mapping
const THEMES = {
  red:    { border: 'border-red-500/25',    label: 'text-red-400',    bg: 'bg-red-500/8'    },
  orange: { border: 'border-orange-500/25', label: 'text-orange-400', bg: 'bg-orange-500/8' },
  blue:   { border: 'border-blue-500/25',   label: 'text-blue-400',   bg: 'bg-blue-500/8'   },
  green:  { border: 'border-green-500/25',  label: 'text-green-400',  bg: 'bg-green-500/8'  },
  purple: { border: 'border-purple-500/25', label: 'text-purple-400', bg: 'bg-purple-500/8' },
  teal:   { border: 'border-teal-500/25',   label: 'text-teal-400',   bg: 'bg-teal-500/8'   },
  yellow: { border: 'border-yellow-500/25', label: 'text-yellow-400', bg: 'bg-yellow-500/8' },
}

/**
 * A single stat display card.
 *
 * Props:
 *   icon     – Lucide icon component
 *   label    – short label string (e.g. "Horsepower")
 *   value    – primary value (e.g. "503")
 *   unit     – unit for primary value (e.g. "HP")
 *   sub      – secondary value string (e.g. "510 PS")
 *   accent   – one of the THEMES keys (default: "red")
 *   size     – "lg" | "md" | "sm" (default: "md")
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  accent = 'red',
  size = 'md',
  delay = 0,
}) {
  if (value == null || value === '' || value === '0' || value === 0) return null

  const theme = THEMES[accent] ?? THEMES.red

  const valueSize =
    size === 'lg' ? 'text-4xl' :
    size === 'md' ? 'text-2xl' :
                   'text-xl'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`
        relative overflow-hidden rounded-xl border ${theme.border}
        bg-surface-raised p-4 flex flex-col gap-0.5
      `}
    >
      {/* Subtle tinted background glow in top-left */}
      <div className={`absolute -top-4 -left-4 w-16 h-16 rounded-full ${theme.bg} blur-xl pointer-events-none`} />

      {/* Label row */}
      <div className={`flex items-center gap-1.5 ${theme.label} text-[10px] font-bold uppercase tracking-widest`}>
        {Icon && <Icon size={11} />}
        <span>{label}</span>
      </div>

      {/* Primary value */}
      <div className={`${valueSize} font-extrabold text-white leading-none tracking-tight mt-1`}>
        {value}
        {unit && (
          <span className="text-slate-400 font-semibold text-sm ml-1.5 tracking-normal">{unit}</span>
        )}
      </div>

      {/* Secondary value */}
      {sub && (
        <div className="text-slate-500 text-xs mt-1 leading-tight">{sub}</div>
      )}
    </motion.div>
  )
}
