'use client'

import { useMemo } from 'react'
import type { Pothole } from '@/lib/types'

export function TopHazardsList({ potholes }: { potholes: Pothole[] }) {
  const ranked = useMemo(() => {
    return [...potholes]
      .sort((a, b) => b.total_detection_hits - a.total_detection_hits)
      .slice(0, 6)
  }, [potholes])

  if (ranked.length === 0) {
    return (
      <div className="p-3">
        <h3 className="text-sm font-bold text-text-primary">Top Hazards</h3>
        <p className="text-xs text-text-muted">By detections</p>
        <div className="mt-3 flex h-32 items-center justify-center">
          <p className="text-xs text-text-muted">No hazards yet</p>
        </div>
      </div>
    )
  }

  const maxHits = ranked[0].total_detection_hits

  const severityColors: Record<string, string> = {
    Severe: '#ef4444',
    Moderate: '#f59e0b',
    Minor: '#22c55e',
    Unknown: '#71717a',
  }

  return (
      <div className="p-4">
        <h3 className="text-xs font-bold text-text-primary">Top Hazards</h3>
        <p className="text-xs text-text-muted">By detections</p>
        <div className="mt-3 space-y-1.5">
        {ranked.map((p, i) => {
          const pct = maxHits > 0 ? (p.total_detection_hits / maxHits) * 100 : 0
          return (
            <div key={p.pothole_id} className="flex items-center gap-2">
              <span className="w-3 text-right text-[11px] font-bold text-text-muted">{i + 1}</span>
              <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: severityColors[p.worst_severity] }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary truncate">#{p.pothole_id}</span>
                  <span className="text-xs font-bold text-text-primary">{p.total_detection_hits}</span>
                </div>
                <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: severityColors[p.worst_severity],
                    }}
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
