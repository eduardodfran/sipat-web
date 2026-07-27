'use client'

import type { Pothole } from '@/lib/types'

const PROVINCE_COLORS = ['#06b6d4', '#f59e0b', '#ef4444', '#22c55e', '#8b5cf6', '#ec4899']

export function HazardsByProvince({ potholes }: { potholes: Pothole[] }) {
  const map = new Map<string, number>()
  for (const p of potholes) {
    if (!p.province) continue
    map.set(p.province, (map.get(p.province) ?? 0) + 1)
  }

  const segments = Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const total = segments.reduce((s, seg) => s + seg.count, 0)
  if (total === 0) {
    return (
      <div className="p-4">
        <h3 className="text-xs font-bold text-text-primary">Hazards by Province</h3>
        <p className="text-xs text-text-muted">Geographic distribution</p>
        <div className="mt-3 flex h-32 items-center justify-center rounded border border-dashed border-border">
          <p className="text-xs text-text-muted">No address data yet</p>
        </div>
      </div>
    )
  }

  const size = 120
  const strokeWidth = 16
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="p-4">
      <h3 className="text-xs font-bold text-text-primary">Hazards by Province</h3>
      <p className="text-xs text-text-muted">Geographic distribution</p>
      <div className="mt-3 flex items-center gap-4">
        <svg width={size} height={size} className="shrink-0 -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
          {segments.map((seg, i) => {
            const pct = seg.count / total
            const dash = pct * circumference
            const el = (
              <circle
                key={seg.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={PROVINCE_COLORS[i % PROVINCE_COLORS.length]}
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
          {segments.map((seg, i) => {
            const color = PROVINCE_COLORS[i % PROVINCE_COLORS.length]
            return (
              <div key={seg.name} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-text-secondary">{seg.name}</span>
                <span className="text-xs font-bold text-text-primary">{seg.count}</span>
                <span className="text-[11px] text-text-muted">({Math.round((seg.count / total) * 100)}%)</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
