'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/Navbar'
import { supabase } from '@/lib/supabase'
import { shortAddress } from '@/lib/address'
import { Badge } from '@/components/ui/Badge'
import type { Severity } from '@/lib/types'

type Tab = 'users' | 'detections'

type UserResult = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

type PhotoResult = {
  id: number
  image_url: string
  caption: string | null
  created_at: string
  detection_status: string | null
  worst_severity: string | null
  reporter_username: string | null
  formatted_address: string | null
}

type PotholeResult = {
  pothole_id: number
  image_url: string | null
  caption: string | null
  formatted_address: string | null
  worst_severity: string | null
  total_detection_hits: number
  citizen_first_reported_at: string | null
  reporter_username: string | null
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-warn/15 text-amber-warn',
  processed: 'bg-red-hazard/15 text-red-hazard',
  no_detection: 'bg-green-safe/15 text-green-safe',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Detected',
  processed: 'Analyzed',
  no_detection: 'Clear',
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('users')
  const [userResults, setUserResults] = useState<UserResult[]>([])
  const [photoResults, setPhotoResults] = useState<PhotoResult[]>([])
  const [potholeResults, setPotholeResults] = useState<PotholeResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const search = useCallback(async (q: string, activeTab: Tab) => {
    const trimmed = q.trim()
    if (!trimmed) {
      setUserResults([])
      setPhotoResults([])
      setPotholeResults([])
      setSearched(false)
      return
    }

    setLoading(true)
    setSearched(true)
    try {
      const pattern = `%${trimmed}%`

      if (activeTab === 'users') {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .or(`username.ilike.${pattern},full_name.ilike.${pattern}`)
          .limit(30)
        setUserResults((data ?? []) as UserResult[])
        setPhotoResults([])
        setPotholeResults([])
      } else {
        const [photosRes, potholesRes] = await Promise.all([
          supabase
            .from('community_photos')
            .select('id, image_url, caption, created_at, detection_status, worst_severity, reporter_username, formatted_address')
            .or(`caption.ilike.${pattern},reporter_username.ilike.${pattern},formatted_address.ilike.${pattern}`)
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('v_unified_potholes')
            .select('pothole_id, image_url, caption, formatted_address, worst_severity, total_detection_hits, citizen_first_reported_at, reporter_username')
            .or(`caption.ilike.${pattern},formatted_address.ilike.${pattern},reporter_username.ilike.${pattern}`)
            .order('citizen_first_reported_at', { ascending: false, nullsFirst: false })
            .limit(20),
        ])
        setPhotoResults((photosRes.data ?? []) as PhotoResult[])
        setPotholeResults((potholesRes.data ?? []) as PotholeResult[])
        setUserResults([])
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  const handleTabChange = useCallback((newTab: Tab) => {
    setTab(newTab)
    if (query.trim()) search(query, newTab)
  }, [query, search])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    search(query, tab)
  }, [query, tab, search])

  const handleClear = useCallback(() => {
    setQuery('')
    setUserResults([])
    setPhotoResults([])
    setPotholeResults([])
    setSearched(false)
    inputRef.current?.focus()
  }, [])

  const resultCount = tab === 'users' ? userResults.length : photoResults.length + potholeResults.length

  return (
    <div className="min-h-screen bg-asphalt">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Search input */}
        <form onSubmit={handleSubmit} className="relative mb-6">
          <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (!e.target.value.trim()) {
                setUserResults([])
                setPhotoResults([])
                setPotholeResults([])
                setSearched(false)
              }
            }}
            placeholder={tab === 'users' ? 'Search users by name or username...' : 'Search detections by address, caption, or reporter...'}
            className="w-full rounded-xl border border-border bg-surface py-3 pl-12 pr-12 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-cyan-accent/40"
          />
          {query.length > 0 && (
            <button type="button" onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-secondary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </form>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => handleTabChange('users')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === 'users'
                ? 'bg-cyan-accent text-asphalt'
                : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            Users
          </button>
          <button
            onClick={() => handleTabChange('detections')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === 'detections'
                ? 'bg-cyan-accent text-asphalt'
                : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Detections
          </button>
          {searched && !loading && (
            <span className="ml-auto self-center text-xs text-text-muted">{resultCount} result{resultCount !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
          </div>
        ) : !searched ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <svg className="h-12 w-12 text-surface-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-lg font-semibold text-text-primary">Search SIPAT</p>
            <p className="text-sm text-text-muted">Find users or road distress reports</p>
          </div>
        ) : tab === 'users' ? (
          userResults.length === 0 ? (
            <div className="py-20 text-center text-sm text-text-muted">No users found</div>
          ) : (
            <div className="flex flex-col">
              {userResults.map((u) => (
                <Link
                  key={u.id}
                  href={`/profile/${u.id}`}
                  className="flex items-center gap-4 border-b border-border py-4 transition-colors hover:bg-surface-hover/50"
                >
                  {u.avatar_url ? (
                    <Image src={u.avatar_url} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface">
                      <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{u.username ?? 'Anonymous'}</p>
                    {u.full_name && <p className="truncate text-xs text-text-muted">{u.full_name}</p>}
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          )
        ) : (
          [...photoResults.map(p => ({ kind: 'photo' as const, data: p })), ...potholeResults.map(p => ({ kind: 'pothole' as const, data: p }))].length === 0 ? (
            <div className="py-20 text-center text-sm text-text-muted">No detections found</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[...photoResults.map(p => ({ kind: 'photo' as const, data: p })), ...potholeResults.map(p => ({ kind: 'pothole' as const, data: p }))].map((item) => {
                if (item.kind === 'photo') {
                  const p = item.data as PhotoResult
                  const statusKey = p.detection_status ?? 'pending'
                  return (
                    <Link
                      key={`photo-${p.id}`}
                      href={`/feed/photo/${p.id}`}
                      className="overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-cyan-accent/20"
                    >
                      <div className="relative aspect-video w-full">
                        <Image src={p.image_url} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
                        <span className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[statusKey] ?? STATUS_COLORS.pending}`}>
                          {STATUS_LABELS[statusKey] ?? statusKey}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="truncate text-sm font-medium text-text-primary">{p.caption ?? 'Community photo'}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                          <span>{p.reporter_username ?? 'Anonymous'}</span>
                          <span>&middot;</span>
                          <span>{new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Link>
                  )
                } else {
                  const p = item.data as PotholeResult
                  return (
                    <Link
                      key={`pothole-${p.pothole_id}`}
                      href={`/feed/pothole/${p.pothole_id}`}
                      className="overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-cyan-accent/20"
                    >
                      <div className="relative aspect-video w-full">
                        {p.image_url ? (
                          <Image src={p.image_url} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-surface-raised">
                            <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                            </svg>
                          </div>
                        )}
                        {p.worst_severity && p.worst_severity !== 'Unknown' && (
                          <span className="absolute left-2 top-2">
                            <Badge severity={p.worst_severity as Severity} />
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {p.formatted_address ? shortAddress({ formatted_address: p.formatted_address } as any) : (p.caption ?? 'Pothole')}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                          <span>{p.reporter_username ?? 'Anonymous'}</span>
                          <span>&middot;</span>
                          <span>{p.total_detection_hits} detection{p.total_detection_hits !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </Link>
                  )
                }
              })}
            </div>
          )
        )}
      </main>
    </div>
  )
}
