import { motion } from 'framer-motion'
import {
  Zap, Gauge, Timer, Wind, Cog, Fuel, Car, ArrowRight,
  Maximize2, Weight, Droplets, Leaf, Users, DoorOpen,
  Activity, RotateCcw, Mountain, Hash
} from 'lucide-react'
import StatCard from './StatCard'
import {
  psToHp, nmToLbFt, kphToMph, kgToLbs, mmToIn, ccToL,
  lToGal, lper100ToMpg, formatEngineType, formatDrive,
  formatTransmission, formatFuel, formatPosition, orNull,
} from '../utils/formatters'

// ── Section header ─────────────────────────────────────────────────────────────
const Section = ({ title, children }) => {
  const visibleChildren = Array.isArray(children)
    ? children.filter(Boolean)
    : children ? [children] : []

  if (visibleChildren.length === 0) return null

  return (
    <div>
      <h3 className="accent-underline text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  )
}

// ── Tag badge ──────────────────────────────────────────────────────────────────
const Tag = ({ label, value, accent = 'slate' }) => {
  if (!value) return null
  const colors = {
    red: 'border-red-500/30 text-red-300 bg-red-950/30',
    green: 'border-green-500/30 text-green-300 bg-green-950/30',
    blue: 'border-blue-500/30 text-blue-300 bg-blue-950/30',
    slate: 'border-surface-border text-slate-400 bg-surface-raised',
  }
  return (
    <span className={`inline-flex flex-col rounded-lg border px-3 py-1.5 text-xs ${colors[accent]}`}>
      <span className="text-[9px] uppercase tracking-widest opacity-70 font-semibold">{label}</span>
      <span className="font-bold text-sm leading-tight mt-0.5">{value}</span>
    </span>
  )
}

export default function StatsPanel({ trim, onTrimChange, allTrims }) {
  if (!trim) return null

  const t = trim // alias

  // ── Computed values ──────────────────────────────────────────────────────────
  const hp       = psToHp(t.model_engine_power_ps)
  const ps       = orNull(t.model_engine_power_ps)
  const lbFt     = nmToLbFt(t.model_engine_torque_nm)
  const nm       = orNull(t.model_engine_torque_nm)
  const topMph   = kphToMph(t.model_top_speed_kph)
  const topKph   = orNull(t.model_top_speed_kph)
  const time060  = orNull(t.model_0_to_100_kph)          // 0–100 kph ≈ 0–62 mph
  const displacement = ccToL(t.model_engine_cc)
  const engineType   = formatEngineType(t.model_engine_type, t.model_engine_cyl)
  const drive        = formatDrive(t.model_drive)
  const transmission = formatTransmission(t.model_transmission_type)
  const fuel         = formatFuel(t.model_engine_fuel)
  const weight       = kgToLbs(t.model_weight_kg)
  const weightKg     = orNull(t.model_weight_kg)
  const fuelCapGal   = lToGal(t.model_fuel_cap_l)
  const fuelCapL     = orNull(t.model_fuel_cap_l)
  const hwMpg        = t.model_lkm_hwy   ? lper100ToMpg(t.model_lkm_hwy)   : null
  const cityMpg      = t.model_lkm_city  ? lper100ToMpg(t.model_lkm_city)  : null
  const lenIn        = mmToIn(t.model_length_mm)
  const widIn        = mmToIn(t.model_width_mm)
  const htIn         = mmToIn(t.model_height_mm)
  const wbIn         = mmToIn(t.model_wheelbase_mm)
  const enginePos    = formatPosition(t.model_engine_position)

  // Car name heading
  const carName = [t.model_year, t.model_make_display, t.model_name, t.model_trim]
    .filter(Boolean).join(' ')

  return (
    <motion.div
      key={trim.model_id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 overflow-y-auto h-full"
    >
      {/* ── Car identity header ── */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white leading-tight">{carName}</h2>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          {t.model_body    && <Tag label="Body"  value={t.model_body}           accent="slate" />}
          {t.model_doors   && <Tag label="Doors" value={`${t.model_doors} Doors`} accent="slate" />}
          {t.model_seats   && <Tag label="Seats" value={`${t.model_seats} Seats`} accent="slate" />}
          {drive           && <Tag label="Drive" value={drive}                  accent="green" />}
          {fuel            && <Tag label="Fuel"  value={fuel}                   accent="blue"  />}
        </div>

        {/* Trim selector (if multiple trims) */}
        {allTrims && allTrims.length > 1 && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Trim:</span>
            <select
              value={trim.model_id}
              onChange={(e) => {
                const next = allTrims.find((x) => x.model_id === e.target.value)
                if (next) onTrimChange(next)
              }}
              className="bg-surface-card border border-surface-border text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent"
            >
              {allTrims.map((tr) => (
                <option key={tr.model_id} value={tr.model_id}>
                  {tr.model_trim || 'Base'} — {tr.model_engine_power_ps ? `${psToHp(tr.model_engine_power_ps)} HP` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── PERFORMANCE ── */}
      <Section title="Performance">
        <StatCard
          icon={Zap}
          label="Horsepower"
          value={hp}
          unit="HP"
          sub={ps ? `${ps} PS` : undefined}
          accent="red"
          size="lg"
          delay={0}
        />
        <StatCard
          icon={Activity}
          label="Torque"
          value={lbFt}
          unit="lb-ft"
          sub={nm ? `${nm} Nm` : undefined}
          accent="orange"
          size="md"
          delay={0.05}
        />
        <StatCard
          icon={Timer}
          label="0–100 km/h"
          value={time060}
          unit="sec"
          sub="(≈ 0–62 mph)"
          accent="red"
          size="md"
          delay={0.1}
        />
        <StatCard
          icon={Gauge}
          label="Top Speed"
          value={topMph}
          unit="mph"
          sub={topKph ? `${topKph} km/h` : undefined}
          accent="orange"
          size="md"
          delay={0.15}
        />
      </Section>

      {/* ── ENGINE ── */}
      <Section title="Engine">
        <StatCard
          icon={Cog}
          label="Displacement"
          value={displacement}
          unit="L"
          sub={t.model_engine_cc ? `${t.model_engine_cc} cc` : undefined}
          accent="blue"
          size="md"
          delay={0.05}
        />
        <StatCard
          icon={Hash}
          label="Configuration"
          value={engineType}
          accent="blue"
          size="md"
          delay={0.1}
        />
        <StatCard
          icon={Mountain}
          label="Engine Position"
          value={enginePos}
          accent="blue"
          size="sm"
          delay={0.15}
        />
        <StatCard
          icon={RotateCcw}
          label="Compression"
          value={orNull(t.model_engine_compression)}
          accent="blue"
          size="sm"
          delay={0.2}
        />
        <StatCard
          icon={Activity}
          label="Power RPM"
          value={orNull(t.model_engine_power_rpm)}
          unit="RPM"
          accent="blue"
          size="sm"
          delay={0.25}
        />
        <StatCard
          icon={Activity}
          label="Torque RPM"
          value={orNull(t.model_engine_torque_rpm)}
          unit="RPM"
          accent="blue"
          size="sm"
          delay={0.3}
        />
      </Section>

      {/* ── DRIVETRAIN ── */}
      <Section title="Drivetrain">
        <StatCard
          icon={Car}
          label="Drive"
          value={drive}
          accent="green"
          size="md"
          delay={0.05}
        />
        <StatCard
          icon={Cog}
          label="Transmission"
          value={transmission}
          accent="green"
          size="md"
          delay={0.1}
        />
        <StatCard
          icon={Hash}
          label="Gears"
          value={orNull(t.model_transmission_gears)}
          accent="green"
          size="sm"
          delay={0.15}
        />
      </Section>

      {/* ── DIMENSIONS & WEIGHT ── */}
      <Section title="Dimensions & Weight">
        <StatCard icon={Maximize2} label="Length"    value={lenIn} unit="in" sub={t.model_length_mm    ? `${t.model_length_mm} mm`    : undefined} accent="purple" size="sm" delay={0.05} />
        <StatCard icon={Maximize2} label="Width"     value={widIn} unit="in" sub={t.model_width_mm     ? `${t.model_width_mm} mm`     : undefined} accent="purple" size="sm" delay={0.1}  />
        <StatCard icon={Maximize2} label="Height"    value={htIn}  unit="in" sub={t.model_height_mm    ? `${t.model_height_mm} mm`    : undefined} accent="purple" size="sm" delay={0.15} />
        <StatCard icon={Maximize2} label="Wheelbase" value={wbIn}  unit="in" sub={t.model_wheelbase_mm ? `${t.model_wheelbase_mm} mm` : undefined} accent="purple" size="sm" delay={0.2}  />
        <StatCard
          icon={Weight}
          label="Curb Weight"
          value={weight}
          unit="lbs"
          sub={weightKg ? `${weightKg} kg` : undefined}
          accent="purple"
          size="sm"
          delay={0.25}
        />
      </Section>

      {/* ── FUEL & EFFICIENCY ── */}
      <Section title="Fuel & Efficiency">
        <StatCard
          icon={Droplets}
          label="Tank Capacity"
          value={fuelCapGal}
          unit="gal"
          sub={fuelCapL ? `${fuelCapL} L` : undefined}
          accent="teal"
          size="sm"
          delay={0.05}
        />
        <StatCard
          icon={Wind}
          label="Highway MPG"
          value={hwMpg}
          unit="MPG"
          sub={t.model_lkm_hwy ? `${t.model_lkm_hwy} L/100km` : undefined}
          accent="teal"
          size="sm"
          delay={0.1}
        />
        <StatCard
          icon={Wind}
          label="City MPG"
          value={cityMpg}
          unit="MPG"
          sub={t.model_lkm_city ? `${t.model_lkm_city} L/100km` : undefined}
          accent="teal"
          size="sm"
          delay={0.15}
        />
        <StatCard
          icon={Leaf}
          label="CO₂"
          value={orNull(t.model_co2)}
          unit="g/km"
          accent="teal"
          size="sm"
          delay={0.2}
        />
        <StatCard
          icon={Fuel}
          label="Fuel Type"
          value={fuel}
          accent="teal"
          size="sm"
          delay={0.25}
        />
      </Section>
    </motion.div>
  )
}
