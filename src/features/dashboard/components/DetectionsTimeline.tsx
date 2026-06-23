'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Pothole } from '@/lib/types'

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-text-primary">{label}</p>
      <p className="text-xs text-text-secondary">{payload[0].value} detection{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  )
}

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
        detections: count,
      }
    })
  }, [potholes])

  if (data.length === 0) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-text-primary">Detections Over Time</h3>
        <p className="mt-0.5 text-xs text-text-muted">Daily detection activity</p>
        <div className="mt-4 flex h-48 items-center justify-center">
          <p className="text-xs text-text-muted">No timeline data yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-text-primary">Detections Over Time</h3>
      <p className="mt-0.5 text-xs text-text-muted">Daily detection activity (last 14 days)</p>
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="detectionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e6a817" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#e6a817" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-text-muted)', strokeDasharray: '3 3' }} />
            <Area
              type="monotone"
              dataKey="detections"
              stroke="#e6a817"
              strokeWidth={2}
              fill="url(#detectionGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
