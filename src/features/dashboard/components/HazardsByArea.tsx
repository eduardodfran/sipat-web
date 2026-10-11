'use client'

import { useMemo, useState } from 'react'
import type { Pothole } from '@/lib/types'

type Mode = 'barangay' | 'street' | 'city'

const MODES: { key: Mode; label: string }[] = [
  { key: 'barangay', label: 'Barangay' },
  { key: 'street', label: 'Street' },
  { key: 'city', label: 'City' },
]

const SEVERITY_COLORS: Record<string, string> = {
  Severe: '#ef4444',
  Moderate: '#f59e0b',
  Minor: '#22c55e',
  Unknown: '#71717a',
}

const SEVERITY_RANK: Record<string, number> = { Minor: 1, Moderate: 2, Severe: 3, Unknown: 0 }

interface AreaRow {
  name: string
  count: number
  worst: string
}

/** Same aggregation semantics as mobile CommunityHazardsSection. */
export function HazardsByArea({ potholes }: { potholes: Pothole[] }) {
  const [mode, setMode] = useState<Mode>('barangay')

  const agg = useMemo(() => {
    const map = new Map<string, AreaRow>()
    let unmapped = 0
    for (const p of potholes) {
      const name = mode === 'barangay' ? p.barangay : mode === 'street' ? p.street : p.city
      if (!name) {
        unmapped++
        continue
      }
      const row = map.get(name) ?? { name, count: 0, worst: 'Unknown' }
      row.count++
      if ((SEVERITY_RANK[p.worst_severity] ?? 0) > (SEVERITY_RANK[row.worst] ?? 0)) {
        row.worst = p.worst_severity
      }
      map.set(name, row)
    }
    const all = [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    return { rows: all.slice(0, 5), areaCount: all.length, unmapped, mapped: potholes.length - unmapped }
  }, [potholes, mode])

  const noun =
    mode === 'barangay'
      ? agg.areaCount === 1 ? 'barangay' : 'barangays'
      : mode === 'street'
        ? agg.areaCount === 1 ? 'street' : 'streets'
        : agg.areaCount === 1 ? 'city' : 'cities'

  return (
    <div className="p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-text-primary">Distress by Area</h3>
          <p className="text-xs text-text-muted">Top areas by hazards</p>
        </div>
        <div className="flex items-center gap-1">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`rounded px-2 py-1 text-[11px] font-semibold transition-colors ${
                mode === m.key
                  ? 'bg-cyan-accent text-asphalt'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {potholes.length === 0 ? (
        <div className="mt-3 flex h-32 items-center justify-center">
          <p className="text-xs text-text-muted">No hazards yet</p>
        </div>
      ) : agg.mapped === 0 ? (
        <div className="mt-3 flex h-32 items-center justify-center">
          <p className="text-xs text-text-muted">No address data yet</p>
        </div>
      ) : (
        <div className="mt-3 space-y-1.5">
          {agg.rows.map((row, i) => {
            const max = agg.rows[0]?.count ?? 1
            const pct = max > 0 ? (row.count / max) * 100 : 0
            return (
              <div key={row.name} className="flex items-center gap-2">
                <span className="w-3 text-right text-[11px] font-bold text-text-muted">{i + 1}</span>
                <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[row.worst] }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-text-secondary">{row.name}</span>
                    <span className="text-xs font-bold text-text-primary">{row.count}</span>
                  </div>
                  <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: SEVERITY_COLORS[row.worst] }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
          {agg.unmapped > 0 && (
            <p className="border-t border-border/50 pt-2 text-[11px] text-text-muted">
              No address — {agg.unmapped}
            </p>
          )}
          <p className="font-mono text-[10px] text-text-muted">
            {agg.mapped} of {potholes.length} mapped · {agg.areaCount} {noun}
          </p>
        </div>
      )}
    </div>
  )
}
