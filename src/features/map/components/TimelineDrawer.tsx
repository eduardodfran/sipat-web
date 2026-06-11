'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import type { Pothole, Severity } from '@/lib/types'

const SEVERITY_FILTERS: Array<Severity | 'All'> = [
  'All',
  'Severe',
  'Moderate',
  'Minor',
]

function HazardImagePlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#0d0d24]">
      <svg
        className="h-10 w-10 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
        />
      </svg>
      <span className="mt-2 text-xs text-gray-600">No image available</span>
    </div>
  )
}

function HazardImageCard({ imageUrl, severity }: { imageUrl: string; severity: Severity }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <HazardImagePlaceholder />
  }

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-lg bg-[#0d0d24] sm:h-52">
      <Image
        src={imageUrl}
        alt={`Hazard detected — ${severity}`}
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
        className="object-cover"
        onError={() => setHasError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-2 left-2">
        <Badge severity={severity} size="md" />
      </div>
    </div>
  )
}

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

      <div className="max-h-[60vh] overflow-y-auto bg-[#0d0d24] px-4 pb-6 pt-2 sm:px-6">
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
        <div className="grid gap-3 sm:grid-cols-2">
          {potholes.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500 sm:col-span-2">
              No hazards match this filter.
            </p>
          )}
          {potholes.map((p) => (
            <div
              key={p.pothole_id}
              className="overflow-hidden rounded-xl border border-white/5 bg-[#13133a] shadow-lg shadow-black/20 ring-1 ring-white/5"
            >
              {/* Image section */}
              <HazardImageCard
                imageUrl={p.image_url ?? ''}
                severity={p.worst_severity}
              />

              {/* Info section */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {p.consolidated_latitude?.toFixed(5) ?? '—'},{' '}
                      {p.consolidated_longitude?.toFixed(5) ?? '—'}
                    </span>
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
                <p className="mt-1 text-sm text-gray-300">
                  Reported{' '}
                  <span className="font-semibold text-white">
                    {p.total_detection_hits}
                  </span>{' '}
                  {p.total_detection_hits === 1 ? 'time' : 'times'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
