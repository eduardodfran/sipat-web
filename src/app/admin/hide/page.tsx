'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'franeduardo305@gmail.com'

const SEVERITIES = ['Severe', 'Moderate', 'Minor', 'Unknown'] as const
type SeverityOption = (typeof SEVERITIES)[number]

function severityOption(value: string | null): SeverityOption {
  return SEVERITIES.includes(value as SeverityOption) ? (value as SeverityOption) : 'Unknown'
}

type Row = {
  content_type: 'pothole' | 'photo'
  content_id: string
  caption: string | null
  street: string | null
  severity: string | null
  is_hidden: boolean
  created_at: string
  image_url: string | null
  lat: number | null
  lng: number | null
  nearby_image_url: string | null
  nearby_m: number | null
}

export default function HiddenAdminHidePage() {
  const { user, loading: authLoading } = useAuth()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [severityBusy, setSeverityBusy] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState<Row | null>(null)

  useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom])

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.rpc('admin_list_recent', { p_limit: 80 })
    if (error) {
      setError(error.message)
      setRows([])
    } else {
      setRows((data ?? []) as Row[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!authLoading && isAdmin) load()
    if (!authLoading && !isAdmin) setLoading(false)
  }, [authLoading, isAdmin, load])

  const toggle = async (row: Row) => {
    const key = `${row.content_type}:${row.content_id}`
    setBusy(key)
    const { error } = await supabase.rpc('admin_hide_content', {
      p_content_type: row.content_type,
      p_content_id: row.content_id,
      p_hide: !row.is_hidden,
    })
    if (error) {
      setError(error.message)
    } else {
      setRows((prev) =>
        prev.map((r) =>
          r.content_type === row.content_type && r.content_id === row.content_id
            ? { ...r, is_hidden: !r.is_hidden }
            : r,
        ),
      )
    }
    setBusy(null)
  }

  const saveSeverity = async (row: Row, severity: SeverityOption) => {
    const key = `${row.content_type}:${row.content_id}`
    if (severityOption(row.severity) === severity) return
    setSeverityBusy(key)
    setError(null)
    const { error } = await supabase.rpc('admin_set_severity', {
      p_content_type: row.content_type,
      p_content_id: row.content_id,
      p_severity: severity,
    })
    if (error) {
      setError(error.message)
    } else {
      setRows((prev) =>
        prev.map((r) =>
          r.content_type === row.content_type && r.content_id === row.content_id
            ? { ...r, severity }
            : r,
        ),
      )
      setZoom((prev) =>
        prev && prev.content_type === row.content_type && prev.content_id === row.content_id
          ? { ...prev, severity }
          : prev,
      )
    }
    setSeverityBusy(null)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      [r.caption ?? '', r.street ?? '', r.content_id, r.severity ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [rows, query])

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-asphalt">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-asphalt px-6 text-center">
        <h1 className="text-xl font-bold text-text-primary">Not found</h1>
        <p className="text-sm text-text-muted">This page does not exist.</p>
        <Link href="/map" className="text-sm text-cyan-accent underline">
          Back to map
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-asphalt px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-[11px] uppercase tracking-widest text-text-muted">Unlisted utility — not in navigation</p>
        <h1 className="mt-1 text-xl font-bold text-text-primary">Hide / Unhide detections</h1>
        <p className="mt-1 text-xs text-text-muted">
          Hiding removes the item from map, feed, heatmap and driving alerts immediately (same mechanism as 3
          reports). Unhide restores it. Use the severity dropdown to correct a classification.
        </p>

        <div className="mt-4 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by street, caption, id, severity…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-cyan-accent"
          />
          <button
            onClick={load}
            className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-sm text-text-primary hover:bg-white/5"
          >
            Refresh
          </button>
        </div>

        {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}

        <div className="mt-4 space-y-2">
          {filtered.map((r) => {
            const key = `${r.content_type}:${r.content_id}`
            const thumb = r.image_url ?? r.nearby_image_url
            const isNearby = !r.image_url && !!r.nearby_image_url
            return (
              <div
                key={key}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  r.is_hidden ? 'border-white/5 bg-white/[0.02] opacity-60' : 'border-white/10 bg-white/[0.04]'
                }`}
              >
                {thumb ? (
                  <button
                    onClick={() => setZoom(r)}
                    title={isNearby ? `Nearest community photo ~${Math.round(r.nearby_m ?? 0)}m away — click to enlarge` : 'Click to enlarge'}
                    className="shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb} alt="" className="h-20 w-20 rounded-xl object-cover transition-transform hover:scale-105 sm:h-24 sm:w-24" />
                  </button>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[10px] text-text-muted sm:h-24 sm:w-24">
                    {r.content_type}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {r.street || r.caption || `#${r.content_id}`}
                    {r.is_hidden && <span className="ml-2 text-[10px] font-bold uppercase text-text-muted">hidden</span>}
                  </p>
                  <p className="truncate text-[11px] text-text-muted">
                    {r.content_type} #{r.content_id} · {r.caption ?? 'no caption'}
                    {isNearby && <span> · nearby photo ~{Math.round(r.nearby_m ?? 0)}m</span>}
                  </p>
                  <label className="mt-1.5 flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                      Severity
                    </span>
                    <select
                      value={severityOption(r.severity)}
                      onChange={(e) => saveSeverity(r, e.target.value as SeverityOption)}
                      disabled={busy === key || severityBusy === key}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-text-primary outline-none focus:border-cyan-accent disabled:opacity-50"
                    >
                      {SEVERITIES.map((severity) => (
                        <option key={severity} value={severity}>
                          {severity}
                        </option>
                      ))}
                    </select>
                    {severityBusy === key && <span className="text-[10px] text-text-muted">Saving…</span>}
                  </label>
                  {r.lat != null && r.lng != null && (
                    <a
                      href={`https://www.google.com/maps?q=${r.lat},${r.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-[11px] text-cyan-accent underline"
                    >
                      Open location in Maps
                    </a>
                  )}
                </div>
                <button
                  onClick={() => toggle(r)}
                  disabled={busy === key || severityBusy === key}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50 ${
                    r.is_hidden
                      ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                      : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                  }`}
                >
                  {busy === key ? '…' : r.is_hidden ? 'Unhide' : 'Hide'}
                </button>
              </div>
            )
          })}
          {!loading && filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-text-muted">No items match.</p>
          )}
        </div>
      </div>

      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoom(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-asphalt p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-text-primary">
                  {zoom.street || zoom.caption || `#${zoom.content_id}`}
                </p>
                <p className="text-[11px] text-text-muted">
                  {zoom.content_type} #{zoom.content_id} · {zoom.severity ?? '—'}
                  {!zoom.image_url && zoom.nearby_image_url && (
                    <span> · nearest community photo ~{Math.round(zoom.nearby_m ?? 0)}m away</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setZoom(null)}
                className="shrink-0 rounded-lg border border-white/10 px-2.5 py-1 text-sm text-text-primary hover:bg-white/5"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {(zoom.image_url ?? zoom.nearby_image_url) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={(zoom.image_url ?? zoom.nearby_image_url) as string}
                alt=""
                className="max-h-[72vh] w-full rounded-xl object-contain bg-black"
              />
            )}
            <p className="mt-2 truncate text-[11px] text-text-muted">{zoom.caption ?? 'no caption'}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-text-muted">
                Severity
                <select
                  value={severityOption(zoom.severity)}
                  onChange={(e) => saveSeverity(zoom, e.target.value as SeverityOption)}
                  disabled={
                    busy === `${zoom.content_type}:${zoom.content_id}` ||
                    severityBusy === `${zoom.content_type}:${zoom.content_id}`
                  }
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-cyan-accent disabled:opacity-50"
                >
                  {SEVERITIES.map((severity) => (
                    <option key={severity} value={severity}>
                      {severity}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => {
                  toggle(zoom)
                  setZoom(null)
                }}
                disabled={
                  busy === `${zoom.content_type}:${zoom.content_id}` ||
                  severityBusy === `${zoom.content_type}:${zoom.content_id}`
                }
                className={`rounded-lg px-4 py-2 text-xs font-bold disabled:opacity-50 ${
                  zoom.is_hidden
                    ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                    : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                }`}
              >
                {zoom.is_hidden ? 'Unhide this item' : 'Hide this item'}
              </button>
              {zoom.lat != null && zoom.lng != null && (
                <a
                  href={`https://www.google.com/maps?q=${zoom.lat},${zoom.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs text-text-primary hover:bg-white/5"
                >
                  Open location in Maps
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
