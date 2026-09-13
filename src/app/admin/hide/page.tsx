'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'franeduardo305@gmail.com'

type Row = {
  content_type: 'pothole' | 'photo'
  content_id: string
  caption: string | null
  street: string | null
  severity: string | null
  is_hidden: boolean
  created_at: string
  image_url: string | null
}

export default function HiddenAdminHidePage() {
  const { user, loading: authLoading } = useAuth()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

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
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] uppercase tracking-widest text-text-muted">Unlisted utility — not in navigation</p>
        <h1 className="mt-1 text-xl font-bold text-text-primary">Hide / Unhide detections</h1>
        <p className="mt-1 text-xs text-text-muted">
          Hiding removes the item from map, feed, heatmap and driving alerts immediately (same mechanism as 3
          reports). Unhide restores it. Use before defense to clean bad pins.
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
            return (
              <div
                key={key}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  r.is_hidden ? 'border-white/5 bg-white/[0.02] opacity-60' : 'border-white/10 bg-white/[0.04]'
                }`}
              >
                {r.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image_url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[10px] text-text-muted">
                    {r.content_type}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {r.street || r.caption || `#${r.content_id}`}
                    {r.is_hidden && <span className="ml-2 text-[10px] font-bold uppercase text-text-muted">hidden</span>}
                  </p>
                  <p className="truncate text-[11px] text-text-muted">
                    {r.content_type} #{r.content_id} · {r.severity ?? '—'} · {r.caption ?? 'no caption'}
                  </p>
                </div>
                <button
                  onClick={() => toggle(r)}
                  disabled={busy === key}
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
    </div>
  )
}
