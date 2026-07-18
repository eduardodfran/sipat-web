'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface ProxyParams {
  table: string
  columns?: string
  count?: 'exact' | null
  head?: boolean
  order?: { column: string; ascending: boolean }
  limit?: number
  filters?: { column: string; operator: string; value: unknown }[]
}

interface CacheEntry {
  data: unknown
  count: number | null
  expiry: number
}

const ttlCache = new Map<string, CacheEntry>()
const TTL = 30_000

function cacheKey(params: ProxyParams): string {
  return JSON.stringify(params)
}

function readCache<T>(key: string): { data: T | null; count: number | null } | null {
  const entry = ttlCache.get(key)
  if (entry && Date.now() < entry.expiry) {
    return { data: entry.data as T, count: entry.count }
  }
  return null
}

export function useServerData<T = unknown>(params: ProxyParams) {
  const key = cacheKey(params)
  const cached = readCache<T>(key)

  const [data, setData] = useState<T | null>(cached?.data ?? null)
  const [count, setCount] = useState<number | null>(cached?.count ?? null)
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)
  const [fetchId, setFetchId] = useState(0)
  const fetchedRef = useRef(!!cached)

  useEffect(() => {
    if (fetchedRef.current) {
      fetchedRef.current = false
      return
    }

    let cancelled = false

    const doFetch = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/cache/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to fetch data')
        }

        const result = await res.json()

        if (!cancelled) {
          ttlCache.set(key, {
            data: result.data,
            count: result.count ?? null,
            expiry: Date.now() + TTL,
          })
          setData(result.data as T)
          setCount(result.count ?? null)
          setError(null)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    doFetch()
    return () => {
      cancelled = true
    }
  }, [key, fetchId]) // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    ttlCache.delete(key)
    setFetchId((id) => id + 1)
  }, [key])

  return { data, count, loading, error, refetch }
}
