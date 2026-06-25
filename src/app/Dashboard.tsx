'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePotholeData } from '@/hooks/usePotholeData'
import HazardSidebar from '@/features/map/components/HazardSidebar'
import { SeverityBarChart } from '@/features/dashboard/components/SeverityBarChart'
import { DetectionsTimeline } from '@/features/dashboard/components/DetectionsTimeline'
import { TopHazardsChart } from '@/features/dashboard/components/TopHazardsChart'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Pothole } from '@/lib/types'

function SeverityBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        <span className="text-xs font-bold text-text-primary">{count}</span>
      </div>
      <div className="h-1.5 bg-white/[0.04]">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function HazardRow({ pothole, onSelect }: { pothole: Pothole; onSelect: (p: Pothole) => void }) {
  const severityColors: Record<string, { dot: string; text: string }> = {
    Severe: { dot: 'bg-red-hazard', text: 'text-red-400' },
    Moderate: { dot: 'bg-amber-warn', text: 'text-amber-400' },
    Minor: { dot: 'bg-green-safe', text: 'text-green-400' },
    Unknown: { dot: 'bg-gray-500', text: 'text-gray-400' },
  }
  const s = severityColors[pothole.worst_severity] ?? severityColors.Unknown

  return (
    <button
      onClick={() => onSelect(pothole)}
      className="flex w-full items-center gap-3 border-b border-border py-3 text-left transition-colors hover:bg-surface-hover last:border-b-0"
    >
      <div className={`h-2.5 w-2.5 shrink-0 ${s.dot}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${s.text}`}>{pothole.worst_severity}</span>
          <span className="text-[11px] text-text-muted">#{pothole.pothole_id}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-text-primary">{pothole.total_detection_hits}</p>
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
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="border border-red-hazard/20 bg-red-hazard/5 p-8 text-center">
          <p className="text-sm font-medium text-red-400">Failed to load hazard data</p>
          <p className="mt-1 text-xs text-red-400/60">{error}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-asphalt p-4">
        <Skeleton className="h-64" />
        <div className="mt-px grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 border-r border-border">
            <Skeleton className="h-80" />
          </div>
          <div className="lg:col-span-7">
            <Skeleton className="h-80" />
          </div>
        </div>
        <Skeleton className="mt-px h-64" />
      </div>
    )
  }

  const recentHazards = allPotholes.slice(0, 6)

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-asphalt">
      {/* HEADLINE SECTION — centered full-width */}
      <div className="border-b border-border bg-surface/30">
        <div className="px-6 py-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Hazard count</p>
          <p className="mt-1 text-[80px] lg:text-[120px] font-black leading-none tracking-tighter text-text-primary">
            {stats.totalPotholes}
          </p>
          <p className="text-xs text-text-secondary mt-2">
            road anomalies detected across all monitored routes
          </p>

          {/* Severity bars horizontal strip */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex-1 max-w-[200px]">
              <SeverityBar label="Severe" count={stats.severeCount} total={stats.totalPotholes} color="bg-red-hazard" />
            </div>
            <div className="flex-1 max-w-[200px]">
              <SeverityBar label="Moderate" count={stats.moderateCount} total={stats.totalPotholes} color="bg-amber-warn" />
            </div>
            <div className="flex-1 max-w-[200px]">
              <SeverityBar label="Minor" count={stats.minorCount} total={stats.totalPotholes} color="bg-green-safe" />
            </div>
          </div>

          {/* Stats inline */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
            {[
              { label: 'Routes', value: stats.routeCount },
              { label: 'GPS Points', value: stats.gpsPointCount.toLocaleString() },
              { label: 'Avg / Hazard', value: stats.totalPotholes > 0 ? Math.round(stats.totalHits / stats.totalPotholes) : 0 },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                {i > 0 && <div className="h-4 w-px bg-border" />}
                <div>
                  <p className="text-lg font-bold text-text-primary">{s.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT SECTION — 40/60 split */}
      <div className="border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left 40%: Recent hazards */}
          <div className="border-r border-border px-6 py-4 lg:col-span-5">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Latest</p>
                <h3 className="mt-1 text-lg font-bold text-text-primary">Recent Hazards</h3>
              </div>
              {allPotholes.length > 6 && (
                <Link
                  href="/map"
                  className="group flex items-center gap-1.5 bg-amber-primary/10 px-3 py-1.5 text-xs font-bold text-amber-primary transition-colors hover:bg-amber-primary/20"
                >
                  View all
                  <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              )}
            </div>

            {recentHazards.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-dashed border-border py-16">
                <p className="text-sm font-semibold text-text-secondary">No hazards detected</p>
                <p className="mt-1 text-xs text-text-muted">Process a ride to start detecting</p>
              </div>
            ) : (
              <div>
                {recentHazards.map((p) => (
                  <HazardRow key={p.pothole_id} pothole={p} onSelect={setSelectedPothole} />
                ))}
              </div>
            )}
          </div>

          {/* Right 60%: Quick actions + severity legend */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <div className="grid grid-cols-2 divide-x divide-border">
              {/* Quick actions */}
              <div className="px-6 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-3">Navigate</p>
                <div className="space-y-1">
                  <Link
                    href="/map"
                    className="group flex items-center gap-3 py-2 text-left transition-colors hover:bg-surface-hover -mx-3 px-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-blue-steel/10">
                      <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-11.063a18.022 18.022 0 013.968 1.373 18.18 18.18 0 016.115 4.874 18.15 18.15 0 013.093 7.368M6.75 4.5v.75A.75.75 0 016 6H4.5a.75.75 0 01-.75-.75v-.75m0 0h1.5m-1.5 0V3.75A2.25 2.25 0 017.875 1.5h.375m0 0h-.375A2.25 2.25 0 006 3.75v.75m0 0H4.5" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary">Open Map</p>
                      <p className="text-xs text-text-muted">Full-screen hazard view</p>
                    </div>
                    <svg className="h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>

                  <Link
                    href="/rides"
                    className="group flex items-center gap-3 py-2 text-left transition-colors hover:bg-surface-hover -mx-3 px-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-green-safe/10">
                      <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary">Ride History</p>
                      <p className="text-xs text-text-muted">View processed rides</p>
                    </div>
                    <svg className="h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Severity legend */}
              <div className="px-6 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-3">Severity Scale</p>
                <div className="space-y-2">
                  {[
                    { label: 'Severe', desc: 'Structural damage risk', color: 'bg-red-hazard' },
                    { label: 'Moderate', desc: 'Vehicle impact possible', color: 'bg-amber-warn' },
                    { label: 'Minor', desc: 'Surface irregularity', color: 'bg-green-safe' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2.5">
                      <div className={`h-2 w-2 shrink-0 ${s.color}`} />
                      <div>
                        <span className="text-xs font-semibold text-text-primary">{s.label}</span>
                        <span className="ml-1.5 text-[10px] text-text-muted">{s.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHART SECTION — full width */}
      <div className="border-b border-border">
        <DetectionsTimeline potholes={allPotholes} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-border">
        <div className="border-r border-border">
          <SeverityBarChart potholes={allPotholes} />
        </div>
        <div>
          <TopHazardsChart potholes={allPotholes} />
        </div>
      </div>

      {/* Hazard Sidebar */}
      <HazardSidebar
        pothole={selectedPothole}
        onClose={() => setSelectedPothole(null)}
      />
    </div>
  )
}
