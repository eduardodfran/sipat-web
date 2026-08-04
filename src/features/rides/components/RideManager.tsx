'use client'

import { useState } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  useRides,
  STATUS_LABELS,
  STATUS_STYLES,
  type Ride,
  type RideStatus,
} from '@/hooks/useRides'

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#1a1a22] px-5 py-4">
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
          {label}
        </p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: RideStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'queued'
            ? 'bg-gray-400'
            : status === 'processing'
              ? 'bg-amber-400'
              : status === 'completed'
                ? 'bg-green-400'
                : 'bg-red-400'
        }`}
      />
      {STATUS_LABELS[status]}
    </span>
  )
}

function RideRow({
  ride,
  onDelete,
  onReprocess,
  actionLoading,
}: {
  ride: Ride
  onDelete: (id: string) => void
  onReprocess: (id: string) => void
  actionLoading: string | null
}) {
  const [expanded, setExpanded] = useState(false)
  const isLoading = actionLoading === ride.id

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#1a1a22] shadow-lg shadow-black/20 ring-1 ring-white/[0.04]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="truncate font-mono text-xs text-gray-400">
              {ride.id.slice(0, 8)}...
            </span>
            <StatusBadge status={ride.status} />
            {ride.status === 'completed' && ride.detection_count === 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400 ring-1 ring-amber-500/30">
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
                No Detections
              </span>
            )}
            {ride.status === 'failed' && ride.error_log && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-red-400 underline underline-offset-2 hover:text-red-300"
              >
                {expanded ? 'Hide error' : 'View error'}
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {new Date(ride.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {ride.status === 'failed' && (
            <button
              onClick={() => onReprocess(ride.id)}
              disabled={isLoading}
              className="rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/25 disabled:opacity-50"
            >
              {isLoading ? '...' : 'Reprocess'}
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm('Delete this ride and its data?')) {
                onDelete(ride.id)
              }
            }}
            disabled={isLoading}
            className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/25 disabled:opacity-50"
          >
            {isLoading ? '...' : 'Delete'}
          </button>
        </div>
      </div>

      {expanded && ride.error_log && (
        <div className="border-t border-white/[0.06] px-4 py-3">
          <pre className="whitespace-pre-wrap break-words text-xs text-red-400/80">
            {ride.error_log}
          </pre>
        </div>
      )}

      <div className="border-t border-white/[0.06] px-4 py-2">
        <div className="flex flex-col gap-1 text-[11px] text-gray-600">
          <span className="truncate">
            <span className="text-gray-500">Video:</span> {ride.video_bucket_path}
          </span>
          <span className="truncate">
            <span className="text-gray-500">GPS:</span> {ride.gps_bucket_path}
          </span>
          {ride.processed_at && (
            <span>
              <span className="text-gray-500">Processed:</span>{' '}
              {new Date(ride.processed_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RideManager({ userId }: { userId?: string | null } = {}) {
  const { rides, loading, actionLoading, refetch, deleteRide, reprocessRide } =
    useRides(userId)

  const stats = {
    total: rides.length,
    queued: rides.filter((r) => r.status === 'queued').length,
    processing: rides.filter((r) => r.status === 'processing').length,
    completed: rides.filter((r) => r.status === 'completed').length,
    failed: rides.filter((r) => r.status === 'failed').length,
  }

  const hasData = rides.length > 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total Rides" value={stats.total} color="text-amber-400" />
        <StatCard label="Queued" value={stats.queued} color="text-gray-400" />
        <StatCard label="Processing" value={stats.processing} color="text-amber-400" />
        <StatCard label="Completed" value={stats.completed} color="text-green-400" />
        <StatCard label="Failed" value={stats.failed} color="text-red-400" />
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !hasData && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#111116] py-16">
          <svg
            className="mb-3 h-12 w-12 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-500">No rides found</p>
          <p className="mt-1 text-xs text-gray-600">
            Recordings from the mobile app will appear here
          </p>
        </div>
      )}

      {/* Ride list */}
      {!loading && hasData && (
        <div className="space-y-3">
          {rides.map((ride) => (
            <RideRow
              key={ride.id}
              ride={ride}
              onDelete={deleteRide}
              onReprocess={reprocessRide}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  )
}
