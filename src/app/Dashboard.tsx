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

function HazardRow({ pothole, onSelect }: { pothole: Pothole; onSelect: (p: Pothole) => void }) {
  const severityColors: Record<string, { dot: string; text: string; border: string; bg: string }> = {
    Severe: { dot: 'bg-red-hazard', text: 'text-red-400', border: 'border-l-red-hazard', bg: 'hover:bg-red-hazard/5' },
    Moderate: { dot: 'bg-amber-warn', text: 'text-amber-400', border: 'border-l-amber-warn', bg: 'hover:bg-amber-warn/5' },
    Minor: { dot: 'bg-green-safe', text: 'text-green-400', border: 'border-l-green-safe', bg: 'hover:bg-green-safe/5' },
    Unknown: { dot: 'bg-gray-500', text: 'text-gray-400', border: 'border-l-gray-500', bg: 'hover:bg-gray-500/5' },
  }
  const statusDot: Record<string, string> = {
    reported: 'bg-blue-400',
    confirmed: 'bg-amber-400',
    fixed: 'bg-green-400',
  }
  const s = severityColors[pothole.worst_severity] ?? severityColors.Unknown
  const st = pothole.status ?? 'reported'

  return (
    <button
      onClick={() => onSelect(pothole)}
      className={`flex w-full items-center gap-3 rounded-lg border-l-2 py-3 pl-3 pr-2 text-left transition-all ${s.border} ${s.bg} hover:pl-4`}
    >
      <div className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${s.text}`}>{pothole.worst_severity}</span>
          <span className="flex items-center gap-1 text-[11px] text-text-secondary">
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot[st] ?? statusDot.reported}`} />
            {st.charAt(0).toUpperCase() + st.slice(1)}
          </span>
        </div>
        <p className="text-[11px] text-text-muted mt-0.5">
          {pothole.consolidated_latitude?.toFixed(3)}, {pothole.consolidated_longitude?.toFixed(3)}
        </p>
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
      <div className="min-h-[calc(100vh-4rem)] p-4">
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
    <div className="min-h-[calc(100vh-4rem)]">
      {/* HEADLINE SECTION — centered full-width */}
      <div className="border-b border-border bg-gradient-to-b from-surface/50 to-transparent">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Active Hazards</p>
          <p className="mt-1 text-[80px] lg:text-[120px] font-black leading-none tracking-tighter text-text-primary drop-shadow-[0_0_30px_rgba(250,250,250,0.1)]">
            {stats.totalPotholes}
          </p>
          <p className="text-xs text-text-secondary mt-2">
            road anomalies detected across all monitored routes
          </p>

          {/* Severity badges */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="h-2 w-2 rounded-full bg-red-hazard" /> Severe {stats.severeCount}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="h-2 w-2 rounded-full bg-amber-warn" /> Moderate {stats.moderateCount}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="h-2 w-2 rounded-full bg-green-safe" /> Minor {stats.minorCount}
            </span>
          </div>

          {/* Stats inline — hide zeros */}
          {(() => {
            const items = [
              { label: 'Routes', value: stats.routeCount },
              { label: 'Avg / Hazard', value: stats.totalPotholes > 0 ? Math.round(stats.totalHits / stats.totalPotholes) : 0 },
            ].filter(s => s.value > 0)
            if (items.length === 0) return null
            return (
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
                {items.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-2">
                    {i > 0 && <div className="h-4 w-px bg-border" />}
                    <div>
                      <p className="text-lg font-bold text-text-primary">{s.value}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      </div>

      {/* CONTENT SECTION — 40/60 split */}
      <div className="p-6 lg:px-8">
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 40%: Recent hazards */}
          <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-surface-raised p-5 lg:col-span-5">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Latest</p>
                <h3 className="mt-1 text-lg font-bold text-text-primary">Recent Hazards</h3>
              </div>
              {allPotholes.length > 6 && (
                  <Link
                    href="/map"
                    className="group flex items-center gap-1.5 bg-cyan-dim px-3 py-1.5 text-xs font-bold text-cyan-accent transition-colors hover:bg-cyan-accent/20"
                  >
                  View all
                  <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              )}
            </div>

            {recentHazards.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white/[0.01] py-16">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-dim">
                  <svg className="h-6 w-6 text-cyan-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
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

          {/* Right 60%: Quick actions */}
          <div className="lg:col-span-7">
              {/* Navigate */}
              <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-surface-raised p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-3">Navigate</p>
                <div className="space-y-2">
                  <Link
                    href="/map"
                    className="group flex items-center gap-3 rounded-lg bg-white/[0.02] p-3 text-left transition-all hover:bg-cyan-dim hover:shadow-[0_0_20px_rgba(6,182,212,0.05)]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-dim transition-colors group-hover:bg-cyan-accent/20">
                      <svg className="h-5 w-5 text-cyan-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-11.063a18.022 18.022 0 013.968 1.373 18.18 18.18 0 016.115 4.874 18.15 18.15 0 013.093 7.368M6.75 4.5v.75A.75.75 0 016 6H4.5a.75.75 0 01-.75-.75v-.75m0 0h1.5m-1.5 0V3.75A2.25 2.25 0 017.875 1.5h.375m0 0h-.375A2.25 2.25 0 006 3.75v.75m0 0H4.5" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary">Open Map</p>
                      <p className="text-xs text-text-muted">Full-screen hazard view</p>
                    </div>
                    <svg className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-cyan-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>

                  <Link
                    href="/rides"
                    className="group flex items-center gap-3 rounded-lg bg-white/[0.02] p-3 text-left transition-all hover:bg-green-safe/5 hover:shadow-[0_0_20px_rgba(34,197,94,0.05)]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-safe/10 transition-colors group-hover:bg-green-safe/20">
                      <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary">Ride History</p>
                      <p className="text-xs text-text-muted">View processed rides</p>
                    </div>
                    <svg className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="px-6 pb-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-surface-raised">
            <DetectionsTimeline potholes={allPotholes} />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-surface-raised">
              <SeverityBarChart potholes={allPotholes} />
            </div>
            <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-surface-raised">
              <TopHazardsChart potholes={allPotholes} />
            </div>
          </div>
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
