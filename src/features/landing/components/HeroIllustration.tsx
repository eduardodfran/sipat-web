'use client'

import { useTheme } from '@/contexts/ThemeContext'

interface HeroIllustrationProps {
  className?: string
}

export function HeroIllustration({ className }: HeroIllustrationProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const fill = isDark ? '#18181b' : '#e5e7eb'
  const screen = isDark ? '#09090b' : '#f3f4f6'
  const stroke = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const gridLine = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'
  const road = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'
  const dimFill = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const textFill = isDark ? '#fafafa' : '#374151'
  const aiText = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'
  const pinInner = isDark ? '#09090b' : '#f3f4f6'

  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g>
        <rect x="24" y="60" width="96" height="180" rx="12" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="32" y="76" width="80" height="132" rx="4" fill={screen} />
        <path d="M68 130L88 120V140L68 130Z" fill="#0891b2" />
        <circle cx="44" cy="84" r="3" fill="#dc2626" />
        <rect x="60" y="220" width="28" height="8" rx="2" fill={dimFill} />
        <text x="74" y="226" fontSize="6" fill={textFill} textAnchor="middle" fontFamily="monospace">02:34</text>
      </g>

      <g>
        <path d="M120 150H180" stroke={stroke} strokeWidth="1.5" strokeDasharray="4 4" />
        <rect x="184" y="116" width="56" height="68" rx="8" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <path d="M200 136C200 136 204 128 212 128C220 128 224 136 224 136" stroke="#0891b2" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="206" cy="142" r="2" fill="#16a34a" />
        <circle cx="218" cy="142" r="2" fill="#16a34a" />
        <circle cx="212" cy="150" r="2" fill="#d97706" />
        <text x="212" y="168" fontSize="7" fill={aiText} textAnchor="middle" fontFamily="monospace">AI</text>
        <path d="M240 150H280" stroke={stroke} strokeWidth="1.5" strokeDasharray="4 4" />
      </g>

      <g>
        <rect x="284" y="60" width="96" height="180" rx="12" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <line x1="310" y1="60" x2="310" y2="240" stroke={gridLine} strokeWidth="0.5" />
        <line x1="336" y1="60" x2="336" y2="240" stroke={gridLine} strokeWidth="0.5" />
        <line x1="362" y1="60" x2="362" y2="240" stroke={gridLine} strokeWidth="0.5" />
        <line x1="284" y1="110" x2="380" y2="110" stroke={gridLine} strokeWidth="0.5" />
        <line x1="284" y1="160" x2="380" y2="160" stroke={gridLine} strokeWidth="0.5" />
        <line x1="284" y1="210" x2="380" y2="210" stroke={gridLine} strokeWidth="0.5" />
        <path d="M290 90H320V180H370" stroke={road} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="320" cy="120" r="5" fill="#dc2626" />
        <circle cx="350" cy="150" r="5" fill="#dc2626" />
        <circle cx="336" cy="180" r="5" fill="#d97706" />
        <circle cx="300" cy="150" r="4" fill="#16a34a" />
        <path d="M345 85C345 85 350 75 350 72C350 69.2 347.8 67 345 67C342.2 67 340 69.2 340 72C340 75 345 85 345 85Z" fill="#0891b2" />
        <circle cx="345" cy="72" r="2" fill={pinInner} />
      </g>

      <g>
        <path d="M114 150L126 150" stroke="#0891b2" strokeWidth="1.5" markerEnd="url(#arrowCyan)" />
        <path d="M240 150L278 150" stroke="#0891b2" strokeWidth="1.5" markerEnd="url(#arrowCyan)" />
      </g>

      <defs>
        <marker id="arrowCyan" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0 0L8 3L0 6" fill="#0891b2" />
        </marker>
      </defs>
    </svg>
  )
}
