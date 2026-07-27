'use client'

import type { Pothole } from '@/lib/types'

export function DetectionSourceDonut({ potholes }: { potholes: Pothole[] }) {
  const mlDetected = potholes.filter(p => p.detectors_count > 0).length
  const citizenReported = potholes.filter(p => p.reporter_username !== null).length
  const total = potholes.length

  if (total === 0) {
    return (
      <div className="p-3">
        <h3 className="text-sm font-bold text-text-primary">Detection Methods</h3>
        <p className="text-xs text-text-muted">How hazards were identified</p>
        <div className="mt-3 flex h-32 items-center justify-center rounded border border-dashed border-border">
          <p className="text-xs text-text-muted">No hazards detected yet</p>
        </div>
      </div>
    )
  }

  const segments = [
    { name: 'ML Detection', count: mlDetected, color: '#06b6d4' },
    { name: 'Citizen Report', count: citizenReported, color: '#f59e0b' },
  ].filter(s => s.count > 0)

  const size = 110
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
      <div className="p-4">
        <h3 className="text-xs font-bold text-text-primary">Detection Methods</h3>
        <p className="text-xs text-text-muted">Hazards may have multiple methods</p>
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
          <text x={size / 2} y={size / 2 - 2} textAnchor="middle" dominantBaseline="central" transform={`rotate(90, ${size / 2}, ${size / 2})`} className="fill-text-primary text-[14px] font-black">
            {total}
          </text>
          <text x={size / 2} y={size / 2 + 10} textAnchor="middle" dominantBaseline="central" transform={`rotate(90, ${size / 2}, ${size / 2})`} className="fill-text-muted text-[10px] font-semibold uppercase tracking-wider">
            total
          </text>
        </svg>
        <div className="flex flex-col gap-1.5">
          {segments.map((seg) => (
            <div key={seg.name} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-xs text-text-secondary">{seg.name}</span>
              <span className="text-xs font-bold text-text-primary">{seg.count}</span>
              <span className="text-[11px] text-text-muted">of {total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
