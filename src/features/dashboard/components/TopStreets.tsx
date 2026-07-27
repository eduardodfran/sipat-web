'use client'

import { useMemo } from 'react'
import type { Pothole } from '@/lib/types'

const severityRank: Record<string, number> = {
  Severe: 3,
  Moderate: 2,
  Minor: 1,
  Unknown: 0,
}

const severityDotClass: Record<string, string> = {
  Severe: 'bg-red-hazard',
  Moderate: 'bg-amber-warn',
  Minor: 'bg-green-safe',
  Unknown: 'bg-text-muted',
}

export function TopStreets({ potholes }: { potholes: Pothole[] }) {
  const ranked = useMemo(() => {
    const map = new Map<string, { count: number; worst: string }>()

    for (const p of potholes) {
      if (!p.street) continue
      const existing = map.get(p.street)
      if (existing) {
        existing.count++
        if ((severityRank[p.worst_severity] ?? 0) > (severityRank[existing.worst] ?? 0)) {
          existing.worst = p.worst_severity
        }
      } else {
        map.set(p.street, { count: 1, worst: p.worst_severity })
      }
    }

    return [...map.entries()]
      .map(([street, { count, worst }]) => ({ street, count, worst }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [potholes])

  if (ranked.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-xs font-bold text-text-primary">Top Streets</h3>
        <p className="text-xs text-text-muted">Most hazardous roads</p>
        <div className="mt-3 flex h-32 items-center justify-center rounded-lg border border-dashed border-white/10">
          <p className="text-xs text-text-muted">Address data comes from community photo submissions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h3 className="text-xs font-bold text-text-primary">Top Streets</h3>
      <p className="text-xs text-text-muted">Most hazardous roads</p>
      <div className="mt-3 space-y-2">
        {ranked.map((item, i) => (
          <div key={item.street} className="flex items-center gap-2">
            <span className="w-3 text-right text-[11px] font-bold text-text-muted">
              {i + 1}
            </span>
            <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${severityDotClass[item.worst]}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary truncate">
                  {item.street}
                </span>
                <span className="text-xs font-bold text-text-primary">
                  {item.count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
