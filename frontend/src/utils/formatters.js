// ── Unit conversions ───────────────────────────────────────────────────────────

/** PS (Pferdestärke) → HP */
export const psToHp = (ps) => (ps ? Math.round(Number(ps) * 0.98632) : null)

/** Newton-metres → pound-feet */
export const nmToLbFt = (nm) => (nm ? Math.round(Number(nm) * 0.73756) : null)

/** km/h → mph */
export const kphToMph = (kph) => (kph ? Math.round(Number(kph) * 0.62137) : null)

/** kg → lbs */
export const kgToLbs = (kg) => (kg ? Math.round(Number(kg) * 2.20462) : null)

/** mm → inches (1 decimal) */
export const mmToIn = (mm) => (mm ? (Number(mm) * 0.03937).toFixed(1) : null)

/** mm → feet+inches string, e.g. "15' 2\"" */
export const mmToFtIn = (mm) => {
  if (!mm) return null
  const totalIn = Number(mm) * 0.03937
  const ft = Math.floor(totalIn / 12)
  const inch = Math.round(totalIn % 12)
  return ft > 0 ? `${ft}' ${inch}"` : `${inch}"`
}

/** cc → litres (1 decimal) */
export const ccToL = (cc) => (cc ? (Number(cc) / 1000).toFixed(1) : null)

/** litres → US gallons (1 decimal) */
export const lToGal = (l) => (l ? (Number(l) * 0.26417).toFixed(1) : null)

/** L/100km → US MPG */
export const lper100ToMpg = (l100) => (l100 ? Math.round(235.215 / Number(l100)) : null)

// ── Engine formatting ──────────────────────────────────────────────────────────

/**
 * Combine engine type code + cylinder count into a readable string.
 * CarQuery uses: "V", "Inline", "Flat", "Rotary", "W" etc.
 */
export const formatEngineType = (type, cyl) => {
  if (!type) return cyl ? `${cyl}-Cyl` : null
  const t = type.trim().toLowerCase()
  const c = cyl ? String(cyl) : ''
  if (t === 'v' || t === 'vee')                      return `V${c}`
  if (t === 'inline' || t === 'i' || t === 'in-line') return `Inline-${c}`
  if (t === 'flat' || t === 'boxer' || t === 'horizontally opposed') return `Flat-${c}`
  if (t === 'rotary' || t === 'wankel')              return 'Rotary'
  if (t === 'w')                                     return `W${c}`
  if (t === 'straight')                              return `Straight-${c}`
  return `${type}-${c}`
}

// ── Drivetrain ─────────────────────────────────────────────────────────────────

const DRIVE_MAP = {
  rwd: 'RWD', fwd: 'FWD', awd: 'AWD', '4wd': '4WD', '4x4': '4WD',
  rear: 'RWD', front: 'FWD', all: 'AWD', '4x2': 'FWD',
}

export const formatDrive = (drive) =>
  DRIVE_MAP[drive?.toLowerCase()] || drive || null

const TRANS_MAP = {
  manual: 'Manual', automatic: 'Automatic', cvt: 'CVT',
  'semi-automatic': 'Semi-Auto', dct: 'Dual-Clutch', 'dual-clutch': 'Dual-Clutch',
}

export const formatTransmission = (type) =>
  TRANS_MAP[type?.toLowerCase()] || type || null

// ── Fuel type ──────────────────────────────────────────────────────────────────

const FUEL_MAP = {
  gasoline: 'Gasoline', diesel: 'Diesel', electric: 'Electric',
  hybrid: 'Hybrid', 'plug-in hybrid': 'Plug-in Hybrid',
  hydrogen: 'Hydrogen', lpg: 'LPG', cng: 'CNG',
}

export const formatFuel = (fuel) =>
  FUEL_MAP[fuel?.toLowerCase()] || fuel || null

// ── Engine position ────────────────────────────────────────────────────────────

export const formatPosition = (pos) => {
  if (!pos) return null
  const p = pos.toLowerCase()
  if (p.includes('front')) return 'Front'
  if (p.includes('mid'))   return 'Mid'
  if (p.includes('rear'))  return 'Rear'
  return pos
}

// ── Generic number formatting ──────────────────────────────────────────────────

/** Format a number with thousands separator */
export const fmtNum = (n) =>
  n != null && n !== '' ? Number(n).toLocaleString() : null

/** Return null if value is falsy / "0" / "0.0" */
export const orNull = (v) => (v && Number(v) !== 0 ? v : null)
