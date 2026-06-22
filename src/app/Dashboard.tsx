'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePotholeData } from '@/hooks/usePotholeData'
import HazardSidebar from '@/features/map/components/HazardSidebar'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Pothole } from '@/lib/types'

function SeverityBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">{label}</span>
        <span className="text-xs font-bold text-white">{count}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function HazardRow({ pothole, onSelect }: { pothole: Pothole; onSelect: (p: Pothole) => void }) {
  const severityColors: Record<string, { dot: string; text: string; bg: string }> = {
    Severe: { dot: 'bg-red-hazard', text: 'text-red-400', bg: 'bg-red-hazard/10' },
    Moderate: { dot: 'bg-amber-warn', text: 'text-amber-400', bg: 'bg-amber-warn/10' },
    Minor: { dot: 'bg-green-safe', text: 'text-green-400', bg: 'bg-green-safe/10' },
    Unknown: { dot: 'bg-gray-500', text: 'text-gray-400', bg: 'bg-gray-500/10' },
  }
  const s = severityColors[pothole.worst_severity] ?? severityColors.Unknown

  return (
    <button
      onClick={() => onSelect(pothole)}
      className="flex w-full items-center gap-3 rounded-xl border border-white/[0.04] bg-surface p-3 text-left transition-all hover:border-amber-primary/20 hover:bg-surface-raised"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.bg}`}>
        <div className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${s.text}`}>{pothole.worst_severity}</span>
          <span className="text-[11px] text-text-muted">#{pothole.pothole_id}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-text-secondary">
          {pothole.consolidated_latitude?.toFixed(4)}, {pothole.consolidated_longitude?.toFixed(4)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-white">{pothole.total_detection_hits}</p>
        <p className="text-[10px] text-text-muted">hits</p>
      </div>
    </button>
  )
}

export default function Dashboard() {
  const { allPotholes, stats, loading, error } = usePotholeData()
  const [selectedPothole, setSelectedPothole] = useState<Pothole | null>(null)

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-8">
        <div className="rounded-2xl border border-red-hazard/20 bg-red-hazard/5 p-8 text-center">
          <p className="text-sm font-medium text-red-400">Failed to load hazard data</p>
          <p className="mt-1 text-xs text-red-400/60">{error}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-8">
        <div className="w-full max-w-6xl space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          </div>
        </div>
      </div>
    )
  }

  const recentHazards = allPotholes.slice(0, 6)

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-asphalt p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Hero Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-amber-primary/10 bg-surface p-5">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-primary/5" />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-primary/10">
              <svg className="h-5 w-5 text-amber-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-white">{stats.totalPotholes}</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Total Hazards</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-red-hazard/10 bg-surface p-5">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-red-hazard/5" />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-hazard/10">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-white">{stats.severeCount}</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Severe</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-blue-steel/10 bg-surface p-5">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-steel/5" />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-steel/10">
              <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-white">{stats.routeCount}</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Routes</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-green-safe/10 bg-surface p-5">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-safe/5" />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-safe/10">
              <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-11.063a18.022 18.022 0 013.968 1.373 18.18 18.18 0 016.115 4.874 18.15 18.15 0 013.093 7.368M6.75 4.5v.75A.75.75 0 016 6H4.5a.75.75 0 01-.75-.75v-.75m0 0h1.5m-1.5 0V3.75A2.25 2.25 0 017.875 1.5h.375m0 0h-.375A2.25 2.25 0 006 3.75v.75m0 0H4.5" />
              </svg>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-white">{stats.gpsPointCount.toLocaleString()}</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">GPS Points</p>
          </div>
        </div>

        {/* Quick Actions + Severity Breakdown */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="rounded-2xl border border-white/[0.04] bg-surface p-5">
            <h3 className="mb-4 text-sm font-bold text-white">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/map"
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.04] bg-surface-raised p-3 text-left transition-all hover:border-amber-primary/20"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-steel/10">
                  <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-11.063a18.022 18.022 0 013.968 1.373 18.18 18.18 0 016.115 4.874 18.15 18.15 0 013.093 7.368M6.75 4.5v.75A.75.75 0 016 6H4.5a.75.75 0 01-.75-.75v-.75m0 0h1.5m-1.5 0V3.75A2.25 2.25 0 017.875 1.5h.375m0 0h-.375A2.25 2.25 0 006 3.75v.75m0 0H4.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">View Map</p>
                  <p className="text-xs text-text-muted">Full-screen hazard map</p>
                </div>
                <svg className="ml-auto h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>

              <Link
                href="/rides"
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.04] bg-surface-raised p-3 text-left transition-all hover:border-green-safe/20"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-safe/10">
                  <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Ride History</p>
                  <p className="text-xs text-text-muted">View processed rides</p>
                </div>
                <svg className="ml-auto h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="rounded-2xl border border-white/[0.04] bg-surface p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-white">Severity Breakdown</h3>
            <div className="space-y-3">
              <SeverityBar label="Severe" count={stats.severeCount} total={stats.totalPotholes} color="bg-red-hazard" />
              <SeverityBar label="Moderate" count={stats.moderateCount} total={stats.totalPotholes} color="bg-amber-warn" />
              <SeverityBar label="Minor" count={stats.minorCount} total={stats.totalPotholes} color="bg-green-safe" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-surface-raised p-3 text-center">
                <p className="text-lg font-bold text-red-400">{stats.severeCount}</p>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Severe</p>
              </div>
              <div className="rounded-xl bg-surface-raised p-3 text-center">
                <p className="text-lg font-bold text-amber-400">{stats.moderateCount}</p>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Moderate</p>
              </div>
              <div className="rounded-xl bg-surface-raised p-3 text-center">
                <p className="text-lg font-bold text-green-400">{stats.minorCount}</p>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Minor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Hazards */}
        <div className="rounded-2xl border border-white/[0.04] bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent Hazards</h3>
            {allPotholes.length > 6 && (
              <Link
                href="/map"
                className="text-xs font-semibold text-amber-primary transition-colors hover:text-amber-dim"
              >
                View all on map
              </Link>
            )}
          </div>

          {recentHazards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-3 text-sm font-medium text-text-secondary">No hazards detected</p>
              <p className="mt-1 text-xs text-text-muted">Process a ride to start detecting potholes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {recentHazards.map((p) => (
                <HazardRow key={p.pothole_id} pothole={p} onSelect={setSelectedPothole} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hazard Sidebar (when clicking a hazard) */}
      <HazardSidebar
        pothole={selectedPothole}
        onClose={() => setSelectedPothole(null)}
      />
    </div>
  )
}
