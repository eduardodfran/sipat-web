'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePotholeData } from '@/hooks/usePotholeData'
import HazardSidebar from '@/features/map/components/HazardSidebar'
import { SeverityBarChart } from '@/features/dashboard/components/SeverityBarChart'
import { DetectionsTimeline } from '@/features/dashboard/components/DetectionsTimeline'
import { TopHazardsChart } from '@/features/dashboard/components/TopHazardsChart'
import { DetectionSourceChart } from '@/features/dashboard/components/DetectionSourceChart'
import { WorstRoadsChart } from '@/features/dashboard/components/WorstRoadsChart'
import { TimeOfDayChart } from '@/features/dashboard/components/TimeOfDayChart'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Pothole } from '@/lib/types'

function getSafetyGrade(hazardCount: number): { grade: string; color: string; description: string } {
  if (hazardCount === 0) return { grade: 'A', color: 'text-green-400', description: 'No hazards detected' }
  if (hazardCount <= 2) return { grade: 'B', color: 'text-green-400', description: 'Low risk' }
  if (hazardCount <= 5) return { grade: 'C', color: 'text-amber-400', description: 'Moderate risk' }
  if (hazardCount <= 10) return { grade: 'D', color: 'text-amber-500', description: 'High risk' }
  return { grade: 'F', color: 'text-red-400', description: 'Critical risk' }
}

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

  const isRecent = (() => {
    const first = new Date(pothole.citizen_first_reported_at)
    const latest = new Date(pothole.latest_activity_at)
    const daysSinceFirst = (Date.now() - first.getTime()) / (1000 * 60 * 60 * 24)
    const daysSinceLatest = (Date.now() - latest.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceLatest <= 2 && daysSinceFirst > 3
  })()

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
      {isRecent && (
        <div className="shrink-0">
          <span className="inline-flex items-center gap-0.5 rounded-full bg-red-hazard/10 px-1.5 py-0.5 text-[9px] font-bold text-red-400">
            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
            ACTIVE
          </span>
        </div>
      )}
    </button>
  )
}

export default function Dashboard() {
  const { allPotholes, stats, loading, error } = usePotholeData()
  const [selectedPothole, setSelectedPothole] = useState<Pothole | null>(null)
  const [timeFilter, setTimeFilter] = useState<'all' | 7 | 30 | 90>('all')

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

  const exportCSV = () => {
    const headers = ['ID', 'Severity', 'Status', 'Latitude', 'Longitude', 'Detections', 'Reported', 'Last Activity']
    const rows = allPotholes.map(p => [
      p.pothole_id,
      p.worst_severity,
      p.status ?? 'reported',
      p.consolidated_latitude,
      p.consolidated_longitude,
      p.total_detection_hits,
      p.citizen_first_reported_at,
      p.latest_activity_at,
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sipat-hazards-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredHazards = timeFilter === 'all'
    ? allPotholes
    : allPotholes.filter(p => {
        const reported = new Date(p.citizen_first_reported_at)
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - timeFilter)
        return reported >= cutoff
      })
  const recentHazards = filteredHazards.slice(0, 6)

  const filteredStats = {
    total: filteredHazards.length,
    severe: filteredHazards.filter(p => p.worst_severity === 'Severe').length,
    moderate: filteredHazards.filter(p => p.worst_severity === 'Moderate').length,
    minor: filteredHazards.filter(p => p.worst_severity === 'Minor').length,
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* HEADLINE SECTION — centered full-width */}
      <div className="border-b border-border bg-gradient-to-b from-surface/50 to-transparent">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Active Hazards</p>
          <p className="mt-1 text-[80px] lg:text-[120px] font-black leading-none tracking-tighter text-text-primary drop-shadow-[0_0_30px_rgba(250,250,250,0.1)]">
            {filteredStats.total}
          </p>
          <p className="text-xs text-text-secondary mt-2">
            road anomalies detected across all monitored routes
          </p>

          {/* Severity badges */}
          <div className="flex items-center justify-center gap-4 mt-5">
              <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="h-2 w-2 rounded-full bg-red-hazard" /> Severe {filteredStats.severe}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="h-2 w-2 rounded-full bg-amber-warn" /> Moderate {filteredStats.moderate}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="h-2 w-2 rounded-full bg-green-safe" /> Minor {filteredStats.minor}
            </span>
          </div>

          {/* Safety grade */}
          {(() => {
            const safety = getSafetyGrade(stats.totalPotholes)
            return (
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Road Safety</span>
                <span className={`text-lg font-black ${safety.color}`}>{safety.grade}</span>
                <span className="text-[10px] text-text-muted">— {safety.description}</span>
              </div>
            )
          })()}

          <div className="flex items-center justify-center gap-3 mt-3">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export CSV
            </button>
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
              <div className="flex items-center gap-1">
                {([7, 30, 90, 'all'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setTimeFilter(d)}
                    className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                      timeFilter === d
                        ? 'bg-cyan-accent text-asphalt'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {d === 'all' ? 'All' : `${d}d`}
                  </button>
                ))}
              </div>
              {filteredHazards.length > 6 && (
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

          <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-surface-raised">
            <DetectionSourceChart potholes={allPotholes} />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-surface-raised">
              <WorstRoadsChart potholes={allPotholes} />
            </div>
            <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-surface-raised">
              <TimeOfDayChart potholes={allPotholes} />
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
