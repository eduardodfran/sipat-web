'use client'

import { useMemo } from 'react'
import type { Pothole } from '@/lib/types'

export function TimeOfDayArc({ potholes }: { potholes: Pothole[] }) {
  const hours = useMemo(() => {
    const h = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 }
    for (const p of potholes) {
      if (!p.citizen_first_reported_at) continue
      const hour = new Date(p.citizen_first_reported_at).getHours()
      if (hour >= 6 && hour < 12) h.Morning++
      else if (hour >= 12 && hour < 18) h.Afternoon++
      else if (hour >= 18 && hour < 22) h.Evening++
      else h.Night++
    }
    return h
  }, [potholes])

  const total = hours.Morning + hours.Afternoon + hours.Evening + hours.Night

  if (total === 0) {
    return (
      <div className="p-3">
        <h3 className="text-sm font-bold text-text-primary">Time of Day</h3>
        <p className="text-xs text-text-muted">When reported</p>
        <div className="mt-3 flex h-32 items-center justify-center rounded border border-dashed border-border">
          <p className="text-xs text-text-muted">No data</p>
        </div>
      </div>
    )
  }

  const periods = [
    { name: 'Morning', count: hours.Morning, icon: '☀️', color: '#f59e0b', time: '6a–12p' },
    { name: 'Afternoon', count: hours.Afternoon, icon: '🌤️', color: '#ef4444', time: '12p–6p' },
    { name: 'Evening', count: hours.Evening, icon: '🌅', color: '#8b5cf6', time: '6p–10p' },
    { name: 'Night', count: hours.Night, icon: '🌙', color: '#06b6d4', time: '10p–6a' },
  ]

  const maxCount = Math.max(...periods.map(p => p.count), 1)

  return (
      <div className="p-4">
        <h3 className="text-xs font-bold text-text-primary">Time of Day</h3>
        <p className="text-xs text-text-muted">When reported</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
        {periods.map((period) => {
          const pct = total > 0 ? (period.count / total) * 100 : 0
          const barH = maxCount > 0 ? (period.count / maxCount) * 48 : 0
          return (
            <div key={period.name} className="flex flex-col items-center gap-1">
              <div className="relative flex h-14 w-full items-end justify-center">
                <div
                  className="w-5 rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${barH}px`,
                    backgroundColor: period.color,
                    opacity: period.count > 0 ? 1 : 0.15,
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-text-primary">{period.count}</p>
                <p className="text-[11px] text-text-muted">{period.name}</p>
                <p className="text-[10px] text-text-muted/60">{period.time}</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex items-center justify-center gap-3">
        {periods.map((p) => (
          <div key={p.name} className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[11px] text-text-muted">{Math.round((p.count / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
