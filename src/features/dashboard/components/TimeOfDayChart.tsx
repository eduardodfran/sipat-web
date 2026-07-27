'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Pothole } from '@/lib/types'

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

export function TimeOfDayChart({ potholes }: { potholes: Pothole[] }) {
  const hours = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 }
  
  for (const p of potholes) {
    if (!p.citizen_first_reported_at) continue
    const hour = new Date(p.citizen_first_reported_at).getHours()
    if (hour >= 6 && hour < 12) hours.Morning++
    else if (hour >= 12 && hour < 18) hours.Afternoon++
    else if (hour >= 18 && hour < 22) hours.Evening++
    else hours.Night++
  }

  const data = [
    { name: 'Morning', count: hours.Morning, fill: '#f59e0b' },
    { name: 'Afternoon', count: hours.Afternoon, fill: '#ef4444' },
    { name: 'Evening', count: hours.Evening, fill: '#8b5cf6' },
    { name: 'Night', count: hours.Night, fill: '#06b6d4' },
  ]

  const total = data.reduce((sum, d) => sum + d.count, 0)

  if (total === 0) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-text-primary">Time of Day</h3>
        <p className="mt-0.5 text-xs text-text-muted">When hazards are reported</p>
        <div className="mt-2 flex h-24 items-center justify-center rounded border border-dashed border-border">
          <p className="text-xs text-text-muted">No data yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3">
      <h3 className="text-sm font-bold text-text-primary">Time of Day</h3>
      <p className="text-xs text-text-muted">When reported</p>
      <div className="mt-2 h-32">
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
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
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
