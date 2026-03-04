export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-surface-border bg-surface-base/80 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shadow-glow">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="white" strokeWidth="1.8">
            <path d="M5 17H3a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14l4 4v4a2 2 0 0 1-2 2h-2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="7.5" cy="17.5" r="2.5"/>
            <circle cx="16.5" cy="17.5" r="2.5"/>
            <path d="M5 9V7a2 2 0 0 1 2-2h6l2 4H5Z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-white tracking-widest leading-none">
            AUTOVERSE
          </h1>
          <p className="text-[10px] text-slate-500 tracking-widest uppercase leading-none mt-0.5">
            The Automotive Encyclopedia
          </p>
        </div>
      </div>

      {/* Right side badge */}
      <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
        <span>Powered by CarQuery API</span>
      </div>
    </header>
  )
}
