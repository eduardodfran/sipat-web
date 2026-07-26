'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const REASONS = ['Spam', 'Inappropriate content', 'Not a pothole', 'Duplicate', 'Other'] as const

export function ReportButton({
  contentType,
  contentId,
}: {
  contentType: 'photo' | 'pothole'
  contentId: string
}) {
  const [reported, setReported] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

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

  const submit = async (reason: string) => {
    if (reported) {
      await supabase.rpc('unreport_content', {
        p_content_type: contentType,
        p_content_id: contentId,
      })
      setReported(false)
    } else {
      await supabase.rpc('report_content', {
        p_content_type: contentType,
        p_content_id: contentId,
        p_reason: reason,
      })
      setReported(true)
    }
    setOpen(false)
  }

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
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-surface shadow-xl">
          {REASONS.map((r) => (
            <button
              key={r}
              onClick={() => submit(r)}
              className="block w-full px-3 py-2 text-left text-[12px] text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary first:rounded-t-xl last:rounded-b-xl"
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
