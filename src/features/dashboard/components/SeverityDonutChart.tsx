'use client'

import type { Pothole } from '@/lib/types'

const SEVERITY_COLORS: Record<string, string> = {
  Severe: '#ef4444',
  Moderate: '#f59e0b',
  Minor: '#22c55e',
  Unknown: '#71717a',
}

export function SeverityDonutChart({ potholes }: { potholes: Pothole[] }) {
  const counts = { Severe: 0, Moderate: 0, Minor: 0, Unknown: 0 }
  for (const p of potholes) counts[p.worst_severity]++

  const total = counts.Severe + counts.Moderate + counts.Minor + counts.Unknown
  if (total === 0) {
    return (
      <div className="p-3">
        <h3 className="text-[11px] font-bold text-text-primary">Severity</h3>
        <p className="text-[9px] text-text-muted">Hazards by level</p>
        <div className="mt-3 flex h-32 items-center justify-center rounded border border-dashed border-border">
          <p className="text-[9px] text-text-muted">No data</p>
        </div>
      </div>
    )
  }

  const segments = [
    { name: 'Severe', count: counts.Severe, color: SEVERITY_COLORS.Severe },
    { name: 'Moderate', count: counts.Moderate, color: SEVERITY_COLORS.Moderate },
    { name: 'Minor', count: counts.Minor, color: SEVERITY_COLORS.Minor },
    ...(counts.Unknown > 0 ? [{ name: 'Unknown', count: counts.Unknown, color: SEVERITY_COLORS.Unknown }] : []),
  ]

  const size = 120
  const strokeWidth = 16
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
      <div className="p-4">
        <h3 className="text-xs font-bold text-text-primary">Severity</h3>
        <p className="text-[10px] text-text-muted">Hazards by level</p>
        <div className="mt-3 flex items-center gap-4">
          <svg width={size} height={size} className="shrink-0 -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
          {segments.map((seg) => {
            const pct = seg.count / total
            const dash = pct * circumference
            const el = (
              <circle
                key={seg.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            )
            offset += dash
            return el
          })}
        </svg>
        <div className="flex flex-col gap-1">
          {segments.map((seg) => (
            <div key={seg.name} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-[9px] text-text-secondary">{seg.name}</span>
              <span className="text-[9px] font-bold text-text-primary">{seg.count}</span>
              <span className="text-[8px] text-text-muted">({Math.round((seg.count / total) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
