'use client'

import type { Pothole } from '@/lib/types'

const SEVERITY_COLORS: Record<string, string> = {
  Severe: 'bg-red-hazard',
  Moderate: 'bg-amber-warn',
  Minor: 'bg-green-safe',
  Unknown: 'bg-gray-500',
}

export function WorstRoadsChart({ potholes }: { potholes: Pothole[] }) {
  // Group by approximate location (rounded to 3 decimal places)
  const locationMap = new Map<string, { count: number; worst: string; hits: number; lat: number; lng: number }>()

  for (const p of potholes) {
    const key = `${p.consolidated_latitude.toFixed(3)},${p.consolidated_longitude.toFixed(3)}`
    const existing = locationMap.get(key)
    if (existing) {
      existing.count++
      existing.hits += p.total_detection_hits
      // Keep worst severity
      const sevOrder: Record<string, number> = { Severe: 3, Moderate: 2, Minor: 1, Unknown: 0 }
      if ((sevOrder[p.worst_severity] ?? 0) > (sevOrder[existing.worst] ?? 0)) {
        existing.worst = p.worst_severity
      }
    } else {
      locationMap.set(key, {
        count: 1,
        worst: p.worst_severity,
        hits: p.total_detection_hits,
        lat: p.consolidated_latitude,
        lng: p.consolidated_longitude,
      })
    }
  }

  const ranked = Array.from(locationMap.entries())
    .sort((a, b) => b[1].hits - a[1].hits)
    .slice(0, 10)

  if (ranked.length === 0) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-text-primary">Worst Roads</h3>
        <p className="mt-0.5 text-xs text-text-muted">Most hazardous locations</p>
        <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-xs text-text-muted">No data yet</p>
        </div>
      </div>
    )
  }

  const maxHits = ranked[0][1].hits

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-text-primary">Worst Roads</h3>
      <p className="mt-0.5 text-xs text-text-muted">Most hazardous locations by detection hits</p>
      <div className="mt-4 space-y-2">
        {ranked.map(([key, data], i) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-5 text-right text-[10px] font-bold text-text-muted">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">{data.lat.toFixed(3)}, {data.lng.toFixed(3)}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${SEVERITY_COLORS[data.worst]}`} />
              </div>
              <div className="mt-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-accent/60 transition-all duration-500"
                  style={{ width: `${(data.hits / maxHits) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-bold text-text-primary">{data.hits}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
