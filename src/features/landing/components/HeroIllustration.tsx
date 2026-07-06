'use client'

interface HeroIllustrationProps {
  className?: string
}

export function HeroIllustration({ className }: HeroIllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left: Phone/Screen with play button */}
      <g>
        {/* Phone outline */}
        <rect
          x="24"
          y="60"
          width="96"
          height="180"
          rx="12"
          fill="#18181b"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1.5"
        />
        {/* Screen area */}
        <rect
          x="32"
          y="76"
          width="80"
          height="132"
          rx="4"
          fill="#09090b"
        />
        {/* Play button triangle */}
        <path
          d="M68 130L88 120V140L68 130Z"
          fill="#06b6d4"
        />
        {/* Recording indicator dot */}
        <circle cx="44" cy="84" r="3" fill="#ef4444" />
        {/* Time display */}
        <rect x="60" y="220" width="28" height="8" rx="2" fill="rgba(255,255,255,0.06)" />
        <text x="74" y="226" fontSize="6" fill="#fafafa" textAnchor="middle" fontFamily="monospace">02:34</text>
      </g>

      {/* Center: AI detection flow */}
      <g>
        {/* Dashed flow line */}
        <path
          d="M120 150H180"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        {/* AI chip/processor */}
        <rect
          x="184"
          y="116"
          width="56"
          height="68"
          rx="8"
          fill="#18181b"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1.5"
        />
        {/* AI brain icon */}
        <path
          d="M200 136C200 136 204 128 212 128C220 128 224 136 224 136"
          stroke="#06b6d4"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="206" cy="142" r="2" fill="#22c55e" />
        <circle cx="218" cy="142" r="2" fill="#22c55e" />
        <circle cx="212" cy="150" r="2" fill="#f59e0b" />
        <text x="212" y="168" fontSize="7" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">AI</text>
        {/* Detection lines from chip */}
        <path
          d="M240 150H280"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      </g>

      {/* Right: Map fragment with hazard dots */}
      <g>
        {/* Map background */}
        <rect
          x="284"
          y="60"
          width="96"
          height="180"
          rx="12"
          fill="#18181b"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1.5"
        />
        {/* Grid lines */}
        <line x1="310" y1="60" x2="310" y2="240" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        <line x1="336" y1="60" x2="336" y2="240" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        <line x1="362" y1="60" x2="362" y2="240" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        <line x1="284" y1="110" x2="380" y2="110" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        <line x1="284" y1="160" x2="380" y2="160" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        <line x1="284" y1="210" x2="380" y2="210" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        {/* Road segments */}
        <path d="M290 90H320V180H370" stroke="rgba(255,255,255,0.08)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {/* Hazard dots - red (high severity) */}
        <circle cx="320" cy="120" r="5" fill="#ef4444" />
        <circle cx="350" cy="150" r="5" fill="#ef4444" />
        {/* Hazard dot - amber (medium severity) */}
        <circle cx="336" cy="180" r="5" fill="#f59e0b" />
        {/* Hazard dot - green (low severity) */}
        <circle cx="300" cy="150" r="4" fill="#22c55e" />
        {/* Location pin */}
        <path
          d="M345 85C345 85 350 75 350 72C350 69.2 347.8 67 345 67C342.2 67 340 69.2 340 72C340 75 345 85 345 85Z"
          fill="#06b6d4"
        />
        <circle cx="345" cy="72" r="2" fill="#09090b" />
      </g>

      {/* Connecting arrows */}
      <g>
        {/* Arrow from phone to AI */}
        <path
          d="M114 150L126 150"
          stroke="#06b6d4"
          strokeWidth="1.5"
          markerEnd="url(#arrowCyan)"
        />
        {/* Arrow from AI to map */}
        <path
          d="M240 150L278 150"
          stroke="#06b6d4"
          strokeWidth="1.5"
          markerEnd="url(#arrowCyan)"
        />
      </g>

      {/* Arrow markers */}
      <defs>
        <marker id="arrowCyan" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0 0L8 3L0 6" fill="#06b6d4" />
        </marker>
      </defs>
    </svg>
  )
}
