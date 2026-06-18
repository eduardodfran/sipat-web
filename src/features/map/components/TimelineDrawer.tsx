'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import PotholeDetailSheet from './PotholeDetailSheet'
import type { Pothole, Severity } from '@/lib/types'

const SEVERITY_FILTERS: Array<Severity | 'All'> = [
  'All',
  'Severe',
  'Moderate',
  'Minor',
]

function HazardImageCard({ imageUrl, severity }: { imageUrl: string; severity: Severity }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    imageUrl ? 'loading' : 'error',
  )

  if (status === 'error') {
    return (
      <div className="relative h-40 w-full overflow-hidden rounded-lg bg-[#1a1a22] sm:h-52">
        <div className="flex h-full w-full flex-col items-center justify-center">
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
      </div>
    )
  }

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-lg bg-[#1a1a22] sm:h-52">
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex animate-pulse flex-col items-center justify-center bg-[#1a1a22]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <span className="mt-2 text-xs text-gray-500">Loading&hellip;</span>
        </div>
      )}
      <Image
        src={imageUrl}
        alt={`Hazard detected — ${severity}`}
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
        className={`object-cover transition-opacity duration-300 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
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
  const [detailPothole, setDetailPothole] = useState<Pothole | null>(null)

  return (
    <>
      <PotholeDetailSheet
        pothole={detailPothole}
        onClose={() => setDetailPothole(null)}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
          expanded ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]'
        }`}
    >
      {/* Drag handle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-center border-t border-white/[0.06] bg-[#14141c] py-2"
        aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
      >
        <div className="h-1 w-10 rounded-full bg-gray-600" />
      </button>

      <div className="max-h-[60vh] overflow-y-auto bg-[#14141c] px-4 pb-6 pt-2 sm:px-6">
        {/* Filters */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Filter:</span>
          {SEVERITY_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => onFilterChange(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filter === s
                  ? 'bg-amber-600 text-white'
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
            <button
              key={p.pothole_id}
              onClick={() => setDetailPothole(p)}
              className="w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#1a1a22] shadow-lg shadow-black/20 ring-1 ring-white/[0.04] text-left transition-colors hover:bg-[#24242e] cursor-pointer"
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
            </button>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}
