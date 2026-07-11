'use client'

import { useMemo } from 'react'
import type { Pothole } from '@/lib/types'

export function DetectionsTimeline({ potholes }: { potholes: Pothole[] }) {
  const data = useMemo(() => {
    const byDate = new Map<string, number>()
    for (const p of potholes) {
      if (!p.citizen_first_reported_at) continue
      const date = new Date(p.citizen_first_reported_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      byDate.set(key, (byDate.get(key) ?? 0) + p.total_detection_hits)
    }

    const sorted = Array.from(byDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)

    return sorted.map(([date, count]) => {
      const d = new Date(date + 'T00:00:00')
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      }
    })
  }, [potholes])

  const maxCount = Math.max(...data.map(d => d.count), 1)
  const totalDetections = data.reduce((s, d) => s + d.count, 0)

  if (data.length === 0) {
    return (
      <div className="p-3">
        <h3 className="text-[11px] font-bold text-text-primary">Detections Over Time</h3>
        <p className="text-[9px] text-text-muted">Last 14 days</p>
        <div className="mt-3 flex h-32 items-center justify-center rounded border border-dashed border-border">
          <p className="text-[9px] text-text-muted">No detection data yet</p>
        </div>
      </div>
    )
  }

  if (data.length === 1) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-text-primary">Detections Over Time</h3>
            <p className="text-[10px] text-text-muted">Last 14 days</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-cyan-accent">{totalDetections}</p>
            <p className="text-[8px] text-text-muted">total</p>
          </div>
        </div>
        <div className="mt-2 flex h-20 items-center justify-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-8 rounded-t bg-cyan-accent/80"
              style={{ height: `${Math.max((data[0].count / maxCount) * 64, 8)}px` }}
            />
            <span className="text-[8px] text-text-muted">{data[0].date}</span>
            <span className="text-[10px] font-bold text-text-primary">{data[0].count}</span>
          </div>
        </div>
      </div>
    )
  }

  const chartW = 100
  const chartH = 64
  const padX = 2
  const padY = 4
  const innerW = chartW - padX * 2
  const innerH = chartH - padY * 2

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: padY + innerH - (d.count / maxCount) * innerH,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${padY + innerH} L${points[0].x},${padY + innerH} Z`

  return (
    <div className="p-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[11px] font-bold text-text-primary">Detections Over Time</h3>
          <p className="text-[9px] text-text-muted">Last 14 days</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-cyan-accent">{totalDetections}</p>
          <p className="text-[8px] text-text-muted">total</p>
        </div>
      </div>

      <div className="relative mt-2">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="h-28 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((pct) => (
            <line
              key={pct}
              x1={padX}
              y1={padY + innerH * (1 - pct)}
              x2={padX + innerW}
              y2={padY + innerH * (1 - pct)}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={0.3}
            />
          ))}
          {/* Area fill */}
          <path d={areaPath} fill="url(#timelineGrad)" />
          {/* Line */}
          <path d={linePath} fill="none" stroke="#06b6d4" strokeWidth={0.8} strokeLinejoin="round" />
          {/* Dots */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={0.8} fill="#06b6d4" />
          ))}
        </svg>
        {/* X-axis labels */}
        <div className="mt-0.5 flex justify-between px-0.5">
          {data.filter((_, i) => i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)).map((d) => (
            <span key={d.date} className="text-[7px] text-text-muted">{d.date}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
