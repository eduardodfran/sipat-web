export function RoadBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.08]" style={{ transform: 'translateZ(0)' }}>
      <svg
        className="h-full w-full"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        style={{ willChange: 'transform' }}
      >
        {/* Road surfaces — consolidated into paths */}
        <g stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="18">
          {/* Horizontal roads */}
          <path d="M0 180 H500 L620 120 H1200" />
          <path d="M0 380 H350 L520 320 H1200" />
          <path d="M0 580 H450 L600 500 H1200" />

          {/* Vertical roads */}
          <path d="M200 800 V680 L280 580 V380 L200 180 V0" />
          <path d="M550 800 V580 L620 500 V320 L550 180 L620 120 V0" />
          <path d="M900 800 V0" />

          {/* Diagonal roads */}
          <path d="M0 700 L450 580" strokeWidth="14" />
          <path d="M620 120 L900 320" strokeWidth="14" />
          <path d="M350 380 L280 580" strokeWidth="14" />

          {/* Side streets */}
          <path d="M380 0 V180 L420 380" strokeWidth="10" />
          <path d="M750 0 V120 M750 320 V500" strokeWidth="10" />
          <path d="M1050 0 V120 M1050 320 V500" strokeWidth="10" />
          <path d="M100 0 V180 M100 380 V580" strokeWidth="10" />
          <path d="M450 580 V800" strokeWidth="10" />
        </g>

        {/* Hazard dots */}
        <circle cx="720" cy="105" r="6" fill="#f59e0b" />
        <circle cx="850" cy="305" r="6" fill="#22c55e" />
        <circle cx="890" cy="305" r="6" fill="#22c55e" />
        <circle cx="930" cy="305" r="6" fill="#22c55e" />
        <circle cx="680" cy="485" r="5" fill="#ef4444" />
      </svg>
    </div>
  )
}
