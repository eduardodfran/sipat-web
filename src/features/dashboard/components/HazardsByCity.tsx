'use client'

import type { Pothole } from '@/lib/types'

export function HazardsByCity({ potholes }: { potholes: Pothole[] }) {
  const cityMap = new Map<string, number>()

  for (const p of potholes) {
    const city = p.city?.trim() || null
    const key = city || 'Unknown'
    cityMap.set(key, (cityMap.get(key) ?? 0) + 1)
  }

  const ranked = Array.from(cityMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  if (ranked.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-xs font-bold text-text-primary">Hazards by City</h3>
        <p className="text-[10px] text-text-muted">Most affected areas</p>
        <div className="mt-3 flex h-32 items-center justify-center rounded border border-dashed border-border">
          <p className="text-[10px] text-text-muted">No address data yet</p>
        </div>
      </div>
    )
  }

  const totalCount = potholes.length
  const maxCount = ranked[0][1]

  return (
    <div className="p-4">
      <h3 className="text-xs font-bold text-text-primary">Hazards by City</h3>
      <p className="text-[10px] text-text-muted">Most affected areas</p>
      <div className="mt-3 space-y-1.5">
        {ranked.map(([city, count], i) => {
          const pct = ((count / totalCount) * 100).toFixed(0)
          return (
            <div key={city} className="flex items-center gap-3">
              <span className="w-5 text-right text-[10px] font-bold text-text-muted">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-text-secondary truncate">{city}</span>
                </div>
                <div className="mt-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-accent to-cyan-accent/60 transition-all duration-500"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-bold text-text-primary tabular-nums">{count}</span>
              <span className="w-8 text-right text-[9px] text-text-muted">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
