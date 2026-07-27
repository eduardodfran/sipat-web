'use client'

import { useMemo } from 'react'
import type { Pothole } from '@/lib/types'
import { shortAddress } from '@/lib/address'

export function TopBarangays({ potholes }: { potholes: Pothole[] }) {
  const ranked = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of potholes) {
      if (!p.barangay) continue
      counts.set(p.barangay, (counts.get(p.barangay) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [potholes])

  if (ranked.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-xs font-bold text-text-primary">Top Barangays</h3>
        <p className="text-xs text-text-muted">Most affected neighborhoods</p>
        <div className="mt-3 flex h-32 items-center justify-center rounded-lg border border-dashed border-white/10">
          <p className="text-xs text-text-muted">Address data comes from community photo submissions</p>
        </div>
      </div>
    )
  }

  const maxCount = ranked[0][1]

  return (
    <div className="p-4">
      <h3 className="text-xs font-bold text-text-primary">Top Barangays</h3>
      <p className="text-xs text-text-muted">Most affected neighborhoods</p>
      <div className="mt-3 space-y-1.5">
        {ranked.map(([name, count], i) => {
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
          return (
            <div key={name} className="flex items-center gap-2">
              <span className="w-3 text-right text-xs font-bold text-text-muted">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary truncate">{name}</span>
                  <span className="text-xs font-bold text-text-primary">{count}</span>
                </div>
                <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-1 rounded-full bg-cyan-accent/60 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
