'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const REASONS = [
  { label: 'Spam', value: 'spam' },
  { label: 'Inappropriate content', value: 'inappropriate' },
  { label: 'Not a pothole', value: 'not_pothole' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'Other', value: 'other' },
] as const

export function ReportButton({
  contentType,
  contentId,
  user,
}: {
  contentType: 'photo' | 'pothole'
  contentId: string
  user?: { email?: string } | null
}) {
  const { user: authUser } = useAuth()
  const activeUser = user ?? authUser

  const [reported, setReported] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reportError, setReportError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (errorTimer.current) clearTimeout(errorTimer.current)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data } = await supabase.rpc('has_user_reported', {
        p_content_type: contentType,
        p_content_id: contentId,
      })
      if (!cancelled) {
        setReported(!!data)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [contentType, contentId])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const showReportError = useCallback((message: string) => {
    setReportError(message)
    if (errorTimer.current) clearTimeout(errorTimer.current)
    errorTimer.current = setTimeout(() => setReportError(null), 3000)
  }, [])

  const submit = async (reason: string) => {
    if (reported) {
      const { error } = await supabase.rpc('unreport_content', {
        p_content_type: contentType,
        p_content_id: contentId,
      })
      if (error) {
        showReportError('Report failed')
        return
      }
      setReported(false)
    } else {
      const { error } = await supabase.rpc('report_content', {
        p_content_type: contentType,
        p_content_id: contentId,
        p_reason: reason,
      })
      if (error) {
        showReportError('Report failed')
        return
      }
      setReported(true)
    }
    setOpen(false)
  }

  if (!activeUser) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => (reported ? submit('') : setOpen(!open))}
        disabled={loading}
        className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
          reported
            ? 'text-red-hazard hover:text-red-hazard/80'
            : 'text-text-muted hover:bg-surface-hover hover:text-text-secondary'
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
        </svg>
        {reported ? 'Reported' : 'Report'}
      </button>
      {reportError && (
        <span
          className="absolute bottom-full right-0 z-50 mb-1 whitespace-nowrap rounded-md border border-red-hazard/30 bg-surface px-1.5 py-0.5 text-[10px] font-medium text-red-hazard shadow-lg"
          role="alert"
        >
          {reportError}
        </span>
      )}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-surface shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-primary">Report</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => submit(r.value)}
              className="block w-full px-3 py-2 text-left text-[12px] text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              {r.label}
            </button>
          ))}
          <button
            onClick={() => setOpen(false)}
            className="block w-full px-3 py-2 text-center text-[12px] text-text-muted transition-colors hover:bg-surface-hover hover:text-text-secondary border-t border-border"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
