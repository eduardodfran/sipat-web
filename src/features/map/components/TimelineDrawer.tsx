'use client'

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
  return (
    <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
      <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-950/85 px-3 py-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <span className="mr-0.5 text-[11px] font-medium text-gray-500">Filter:</span>
        {SEVERITY_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => onFilterChange(s)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              filter === s
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {s === 'All' ? `All (${allCount})` : s}
          </button>
        ))}
      </div>
    </div>
  )
}
