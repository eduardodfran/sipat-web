'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Pothole } from '@/lib/types'

const SEVERITY_COLORS: Record<string, string> = {
  Severe: '#ef4444',
  Moderate: '#f59e0b',
  Minor: '#22c55e',
  Unknown: '#71717a',
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; count: number } }> }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-text-primary">{data.name}</p>
      <p className="text-xs text-text-secondary">{data.count} hazard{data.count !== 1 ? 's' : ''}</p>
    </div>
  )
}

export function SeverityBarChart({ potholes }: { potholes: Pothole[] }) {
  const counts = { Severe: 0, Moderate: 0, Minor: 0, Unknown: 0 }
  for (const p of potholes) {
    counts[p.worst_severity]++
  }

  const data = [
    { name: 'Severe', count: counts.Severe, fill: SEVERITY_COLORS.Severe },
    { name: 'Moderate', count: counts.Moderate, fill: SEVERITY_COLORS.Moderate },
    { name: 'Minor', count: counts.Minor, fill: SEVERITY_COLORS.Minor },
    ...(counts.Unknown > 0 ? [{ name: 'Unknown', count: counts.Unknown, fill: SEVERITY_COLORS.Unknown }] : []),
  ]

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-text-primary">Severity Distribution</h3>
      <p className="mt-0.5 text-xs text-text-muted">Hazards by severity level</p>
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={72}
              tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface-hover)' }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
