'use client'

import type { Pothole } from '@/lib/types'

const SEVERITY_COLORS: Record<string, string> = {
  Severe: '#ef4444',
  Moderate: '#f59e0b',
  Minor: '#22c55e',
}

interface CityData {
  city: string
  Severe: number
  Moderate: number
  Minor: number
  total: number
}

export function SeverityByCity({ potholes }: { potholes: Pothole[] }) {
  const cityMap = new Map<string, CityData>()

  for (const p of potholes) {
    const city = p.city || 'Unknown'
    if (!cityMap.has(city)) {
      cityMap.set(city, { city, Severe: 0, Moderate: 0, Minor: 0, total: 0 })
    }
    const entry = cityMap.get(city)!
    if (p.worst_severity === 'Severe' || p.worst_severity === 'Moderate' || p.worst_severity === 'Minor') {
      entry[p.worst_severity]++
      entry.total++
    }
  }

  const cities = [...cityMap.values()]
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)

  if (cities.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-xs font-bold text-text-primary">Severity by City</h3>
        <p className="text-xs text-text-muted">Hazard severity breakdown</p>
        <div className="mt-2 flex h-32 items-center justify-center rounded border border-dashed border-border">
          <p className="text-xs text-text-muted">Address data comes from community photo submissions</p>
        </div>
      </div>
    )
  }

  const maxTotal = Math.max(...cities.map((c) => c.total))

  return (
    <div className="p-4">
      <h3 className="text-xs font-bold text-text-primary">Severity by City</h3>
      <p className="text-xs text-text-muted">Hazard severity breakdown</p>

      <div className="mt-3 flex items-center gap-3">
        {(Object.entries(SEVERITY_COLORS) as [string, string][]).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-text-secondary">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {cities.map((city) => {
          const severeWidth = (city.Severe / maxTotal) * 100
          const moderateWidth = (city.Moderate / maxTotal) * 100
          const minorWidth = (city.Minor / maxTotal) * 100

          return (
            <div key={city.city} className="flex items-center gap-2">
              <span className="w-20 shrink-0 truncate text-xs text-text-secondary" title={city.city}>
                {city.city}
              </span>
              <div className="relative h-3 flex-1 overflow-hidden rounded-sm bg-border/30">
                {city.Severe > 0 && (
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{ width: `${severeWidth}%`, backgroundColor: SEVERITY_COLORS.Severe }}
                  />
                )}
                {city.Moderate > 0 && (
                  <div
                    className="absolute inset-y-0"
                    style={{
                      left: `${severeWidth}%`,
                      width: `${moderateWidth}%`,
                      backgroundColor: SEVERITY_COLORS.Moderate,
                    }}
                  />
                )}
                {city.Minor > 0 && (
                  <div
                    className="absolute inset-y-0"
                    style={{
                      left: `${severeWidth + moderateWidth}%`,
                      width: `${minorWidth}%`,
                      backgroundColor: SEVERITY_COLORS.Minor,
                    }}
                  />
                )}
              </div>
              <div className="flex shrink-0 gap-1.5 text-xs">
                {city.Severe > 0 && <span className="text-text-secondary">{city.Severe}</span>}
                {city.Moderate > 0 && <span className="text-text-secondary">{city.Moderate}</span>}
                {city.Minor > 0 && <span className="text-text-secondary">{city.Minor}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
