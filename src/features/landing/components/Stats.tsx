'use client'

import { useLandingData } from '@/features/landing/hooks/useLandingData'

export function Stats() {
  const data = useLandingData()

  const format = (n: number | null) => (n != null ? n.toLocaleString() : '—')

  const cells = [
    { value: format(data.potholeCount), label: 'Hazards', trend: null, trendColor: null },
    { value: format(data.ridesCount), label: 'Rides', trend: null, trendColor: null },
    { value: '12', label: 'Areas', trend: null, trendColor: null },
  ]

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">

        <div className="bg-border flex w-full gap-px">
      {cells.map((cell, i) => (
        <div key={i} className="bg-asphalt flex flex-1 flex-col items-center gap-1 py-6">
          <div className="flex items-start gap-1">
            <span className="text-text-primary font-mono text-3xl font-bold tabular-nums">
              {cell.value}
            </span>
            {cell.trend && (
              <span className={`mt-1 text-[10px] font-medium ${cell.trendColor}`}>
                {cell.trend}
              </span>
            )}
          </div>
          <span className="text-text-muted text-[10px] font-semibold uppercase tracking-widest">
            {cell.label}
          </span>
        </div>
      ))}
        </div>
        <div className="bg-asphalt mt-px flex items-center gap-2 border-t border-border px-6 py-3">
          <span className="text-text-muted text-xs">
            Severe: {data.severeCount} • Moderate: {data.moderateCount} • Minor: {data.minorCount}
          </span>
        </div>
      </div>
    </section>
  )
}
