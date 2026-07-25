'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePotholeData } from '@/hooks/usePotholeData'
import HazardSidebar from '@/features/map/components/HazardSidebar'
import { SeverityDonutChart } from '@/features/dashboard/components/SeverityDonutChart'
import { DetectionsTimeline } from '@/features/dashboard/components/DetectionsTimeline'
import { TopHazardsList } from '@/features/dashboard/components/TopHazardsList'
import { DetectionSourceDonut } from '@/features/dashboard/components/DetectionSourceDonut'
import { WorstRoadsChart } from '@/features/dashboard/components/WorstRoadsChart'
import { TimeOfDayArc } from '@/features/dashboard/components/TimeOfDayArc'
import { HazardsByCity } from '@/features/dashboard/components/HazardsByCity'
import { HazardsByProvince } from '@/features/dashboard/components/HazardsByProvince'
import { SeverityByCity } from '@/features/dashboard/components/SeverityByCity'
import { TopBarangays } from '@/features/dashboard/components/TopBarangays'
import { TopStreets } from '@/features/dashboard/components/TopStreets'
import { Skeleton } from '@/components/ui/Skeleton'
import { shortAddress } from '@/lib/address'
import { supabase } from '@/lib/supabase'
import type { Pothole } from '@/lib/types'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'

function getSafetyGrade(hazardCount: number): { grade: string; color: string; description: string } {
  if (hazardCount === 0) return { grade: 'A', color: 'text-green-400', description: 'No hazards' }
  if (hazardCount <= 2) return { grade: 'B', color: 'text-green-400', description: 'Low risk' }
  if (hazardCount <= 5) return { grade: 'C', color: 'text-amber-400', description: 'Moderate' }
  if (hazardCount <= 10) return { grade: 'D', color: 'text-amber-500', description: 'High risk' }
  return { grade: 'F', color: 'text-red-400', description: 'Critical' }
}

function HazardRow({ pothole, onSelect }: { pothole: Pothole; onSelect: (p: Pothole) => void }) {
  const severityColors: Record<string, { dot: string; text: string; border: string }> = {
    Severe: { dot: 'bg-red-hazard', text: 'text-red-400', border: 'border-l-red-hazard' },
    Moderate: { dot: 'bg-amber-warn', text: 'text-amber-400', border: 'border-l-amber-warn' },
    Minor: { dot: 'bg-green-safe', text: 'text-green-400', border: 'border-l-green-safe' },
    Unknown: { dot: 'bg-gray-500', text: 'text-gray-400', border: 'border-l-gray-500' },
  }
  const s = severityColors[pothole.worst_severity] ?? severityColors.Unknown

  return (
    <button
      onClick={() => onSelect(pothole)}
      className={`flex w-full items-center gap-3 border-l-2 py-2.5 pl-3 pr-2.5 text-left transition-all hover:bg-white/[0.03] ${s.border}`}
    >
      <div className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${s.text}`}>{pothole.worst_severity}</span>
          <span className="text-xs text-text-muted truncate">
            {shortAddress(pothole)}
          </span>
        </div>
      </div>
      <span className="text-sm font-bold text-text-primary">{pothole.total_detection_hits}</span>
    </button>
  )
}

export default function Dashboard() {
  const { allPotholes, stats, loading, error } = usePotholeData()
  const [selectedPothole, setSelectedPothole] = useState<Pothole | null>(null)
  const [timeFilter, setTimeFilter] = useState<'all' | 7 | 30 | 90>('all')
  const [communityPhotos, setCommunityPhotos] = useState<CommunityPhoto[]>([])

  useEffect(() => {
    supabase
      .from('community_photos')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCommunityPhotos((data ?? []) as CommunityPhoto[])
      })
  }, [])

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="border border-red-hazard/20 bg-red-hazard/5 p-6 text-center">
          <p className="text-xs font-medium text-red-400">Failed to load</p>
          <p className="mt-1 text-[10px] text-red-400/60">{error}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <Skeleton className="h-20" />
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
        </div>
        <Skeleton className="mt-4 h-96" />
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

  const filteredStats = {
    total: filteredHazards.length,
    severe: filteredHazards.filter(p => p.worst_severity === 'Severe').length,
    moderate: filteredHazards.filter(p => p.worst_severity === 'Moderate').length,
    minor: filteredHazards.filter(p => p.worst_severity === 'Minor').length,
  }

  const safety = getSafetyGrade(stats.totalPotholes)

  return (
    <div className="min-h-[calc(100vh-4rem)] px-6 pb-6 pt-6">
      {/* HEADER BAR */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
          <span className="text-sm text-text-muted">•</span>
          <span className="text-sm text-text-muted">Road Hazard Overview</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/map" className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary">
            Map
          </Link>
          <Link href="/rides" className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary">
            Rides
          </Link>
          <button
            onClick={exportCSV}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            Export
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="mb-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-7">
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-text-muted">Total</p>
          <p className="mt-3 text-5xl font-black text-text-primary">{filteredStats.total}</p>
          <p className="mt-2 text-sm text-text-muted">hazards detected</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-text-muted">Severe</p>
          <p className="mt-3 text-5xl font-black text-red-400">{filteredStats.severe}</p>
          <p className="mt-2 text-sm text-text-muted">critical hazards</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-text-muted">Moderate</p>
          <p className="mt-3 text-5xl font-black text-amber-400">{filteredStats.moderate}</p>
          <p className="mt-2 text-sm text-text-muted">warnings</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-text-muted">Minor</p>
          <p className="mt-3 text-5xl font-black text-green-400">{filteredStats.minor}</p>
          <p className="mt-2 text-sm text-text-muted">low severity</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-text-muted">Routes</p>
          <p className="mt-3 text-5xl font-black text-text-primary">{stats.routeCount}</p>
          <p className="mt-2 text-sm text-text-muted">monitored</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-text-muted">Avg / Hazard</p>
          <p className="mt-3 text-5xl font-black text-text-primary">
            {stats.totalPotholes > 0 ? Math.round(stats.totalHits / stats.totalPotholes) : 0}
          </p>
          <p className="mt-2 text-sm text-text-muted">detections</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-text-muted">Community</p>
          <p className="mt-3 text-5xl font-black text-cyan-400">{communityPhotos.length}</p>
          <p className="mt-2 text-sm text-text-muted">photos submitted</p>
        </div>
      </div>

      {/* MAIN CONTENT: 3-column bento grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT: Hazards list + Detection Sources */}
        <div className="space-y-6 lg:col-span-3">
          {/* Hazards list */}
          <div className="rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-bold text-text-primary">Recent Hazards</p>
                <p className="text-xs text-text-muted">{filteredHazards.length} total</p>
              </div>
              <div className="flex items-center gap-1">
                {([7, 30, 'all'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setTimeFilter(d)}
                    className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
                      timeFilter === d
                        ? 'bg-cyan-accent text-asphalt'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {d === 'all' ? 'All' : `${d}d`}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-h-[480px] divide-y divide-border/50 overflow-y-auto">
              {filteredHazards.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-text-muted">No hazards detected</p>
                </div>
              ) : (
                filteredHazards.slice(0, 20).map((p) => (
                  <HazardRow key={p.pothole_id} pothole={p} onSelect={setSelectedPothole} />
                ))
              )}
            </div>
          </div>

          {/* Detection Sources */}
          <div className="rounded-xl border border-border bg-surface">
            <DetectionSourceDonut potholes={allPotholes} />
          </div>
        </div>

        {/* CENTER: Timeline + Severity + Top Hazards */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-xl border border-border bg-surface">
            <DetectionsTimeline potholes={allPotholes} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-surface">
              <SeverityDonutChart potholes={allPotholes} />
            </div>
            <div className="rounded-xl border border-border bg-surface">
              <TopHazardsList potholes={allPotholes} />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface">
            <WorstRoadsChart potholes={allPotholes} />
          </div>
        </div>

        {/* RIGHT: Time of Day + Safety + Quick Links */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-xl border border-border bg-surface">
            <TimeOfDayArc potholes={allPotholes} />
          </div>
          <div className="rounded-xl border border-border bg-surface p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-text-muted">Road Safety</p>
            <div className="mt-4 flex items-baseline gap-5">
              <span className={`text-7xl font-black ${safety.color}`}>{safety.grade}</span>
              <div>
                <p className="text-base font-semibold text-text-primary">{safety.description}</p>
                <p className="text-sm text-text-muted">based on {stats.totalPotholes} hazard{stats.totalPotholes !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-text-muted">Quick Actions</p>
            <div className="space-y-3">
              <Link
                href="/map"
                className="flex items-center gap-2 rounded-md bg-white/[0.02] px-2.5 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-cyan-dim hover:text-cyan-accent"
              >
                <svg className="h-3 w-3 text-cyan-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-11.063a18.022 18.022 0 013.968 1.373 18.18 18.18 0 016.115 4.874 18.15 18.15 0 013.093 7.368M6.75 4.5v.75A.75.75 0 016 6H4.5a.75.75 0 01-.75-.75v-.75m0 0h1.5m-1.5 0V3.75A2.25 2.25 0 017.875 1.5h.375m0 0h-.375A2.25 2.25 0 006 3.75v.75m0 0H4.5" />
                </svg>
                Open Map
              </Link>
              <Link
                href="/rides"
                className="flex items-center gap-2 rounded-md bg-white/[0.02] px-2.5 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-green-safe/5 hover:text-green-400"
              >
                <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Ride History
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ADDRESS ANALYTICS SECTION */}
      <div className="mt-8">
        <div className="mb-5 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <p className="text-sm font-bold uppercase tracking-widest text-text-muted">Address Analytics</p>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: City bar + Severity by City */}
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-xl border border-border bg-surface">
              <HazardsByCity potholes={allPotholes} />
            </div>
            <div className="rounded-xl border border-border bg-surface">
              <SeverityByCity potholes={allPotholes} />
            </div>
          </div>

          {/* Center: Province donut + Top Barangays */}
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-xl border border-border bg-surface">
              <HazardsByProvince potholes={allPotholes} />
            </div>
            <div className="rounded-xl border border-border bg-surface">
              <TopBarangays potholes={allPotholes} />
            </div>
          </div>

          {/* Right: Top Streets */}
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-xl border border-border bg-surface">
              <TopStreets potholes={allPotholes} />
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
