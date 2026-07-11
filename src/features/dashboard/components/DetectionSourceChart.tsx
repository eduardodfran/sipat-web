'use client'

import type { Pothole } from '@/lib/types'

export function DetectionSourceChart({ potholes }: { potholes: Pothole[] }) {
  const mlDetected = potholes.filter(p => p.detectors_count > 0).length
  const citizenReported = potholes.filter(p => p.reporter_username !== null).length
  const total = potholes.length

  if (total === 0) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-text-primary">Detection Sources</h3>
        <p className="mt-0.5 text-xs text-text-muted">How hazards were identified</p>
        <div className="mt-2 flex h-24 items-center justify-center rounded border border-dashed border-border">
          <p className="text-xs text-text-muted">No data yet</p>
        </div>
      </div>
    )
  }

  const mlPct = total > 0 ? (mlDetected / total) * 100 : 0
  const citizenPct = total > 0 ? (citizenReported / total) * 100 : 0

  return (
    <div className="p-3">
      <h3 className="text-[11px] font-bold text-text-primary">Detection Sources</h3>
      <p className="text-[9px] text-text-muted">How identified</p>

      <div className="mt-2 space-y-2">
        {/* ML Detection */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">ML Detection</span>
            <span className="text-xs font-bold text-text-primary">{mlDetected} <span className="font-normal text-text-muted">({Math.round(mlPct)}%)</span></span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-cyan-accent transition-all duration-500" style={{ width: `${mlPct}%` }} />
          </div>
        </div>

        {/* Citizen Report */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">Citizen Report</span>
            <span className="text-xs font-bold text-text-primary">{citizenReported} <span className="font-normal text-text-muted">({Math.round(citizenPct)}%)</span></span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-amber-warn transition-all duration-500" style={{ width: `${citizenPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
