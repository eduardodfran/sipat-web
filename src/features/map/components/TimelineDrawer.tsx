'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import type { Pothole, Severity } from '@/lib/types'

const SEVERITY_FILTERS: Array<Severity | 'All'> = [
  'All',
  'Severe',
  'Moderate',
  'Minor',
]

export function TimelineDrawer({
  potholes,
  allCount,
  filter,
  onFilterChange,
}: {
  potholes: Pothole[]
  allCount: number
  filter: Severity | 'All'
  onFilterChange: (f: Severity | 'All') => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
        expanded ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]'
      }`}
    >
      {/* Drag handle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-center border-t border-white/5 bg-[#0d0d24] py-2"
        aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
      >
        <div className="h-1 w-10 rounded-full bg-gray-600" />
      </button>

      <div className="max-h-[60vh] overflow-y-auto bg-[#0d0d24] px-6 pb-6 pt-2">
        {/* Filters */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Filter:</span>
          {SEVERITY_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => onFilterChange(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {s === 'All' ? `All (${allCount})` : s}
            </button>
          ))}
        </div>

        {/* Hazard list */}
        <div className="space-y-2">
          {potholes.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">
              No hazards match this filter.
            </p>
          )}
          {potholes.map((p) => (
            <div
              key={p.pothole_id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-[#13133a] px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge severity={p.worst_severity} />
                  <span className="text-xs text-gray-500">
                    {p.consolidated_latitude?.toFixed(5) ?? '—'},{' '}
                    {p.consolidated_longitude?.toFixed(5) ?? '—'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-300">
                  Reported <span className="font-semibold text-white">{p.total_detection_hits}</span>{' '}
                  {p.total_detection_hits === 1 ? 'time' : 'times'}
                </p>
              </div>
              <div className="text-right text-xs text-gray-500">
                {p.latest_activity_at
                  ? new Date(p.latest_activity_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
