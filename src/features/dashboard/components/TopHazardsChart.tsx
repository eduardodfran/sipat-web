'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Pothole } from '@/lib/types'

const SEVERITY_COLORS: Record<string, string> = {
  Severe: '#ef4444',
  Moderate: '#f59e0b',
  Minor: '#22c55e',
  Unknown: '#71717a',
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; hits: number; severity: string } }> }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-text-primary">{data.name}</p>
      <p className="text-xs text-text-secondary">{data.hits} detections · {data.severity}</p>
    </div>
  )
}

export function TopHazardsChart({ potholes }: { potholes: Pothole[] }) {
  const data = potholes
    .slice(0, 8)
    .sort((a, b) => b.total_detection_hits - a.total_detection_hits)
    .map((p) => ({
      name: `#${p.pothole_id}`,
      hits: p.total_detection_hits,
      severity: p.worst_severity,
      fill: SEVERITY_COLORS[p.worst_severity] ?? SEVERITY_COLORS.Unknown,
    }))

  if (data.length === 0) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-text-primary">Top Hazards by Detections</h3>
        <p className="mt-0.5 text-xs text-text-muted">Most frequently detected hazards</p>
        <div className="mt-4 flex h-48 items-center justify-center">
          <p className="text-xs text-text-muted">No hazards yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-text-primary">Top Hazards by Detections</h3>
      <p className="mt-0.5 text-xs text-text-muted">Most frequently detected hazards</p>
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface-hover)' }} />
            <Bar dataKey="hits" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {data.map((entry) => (
                <rect key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
