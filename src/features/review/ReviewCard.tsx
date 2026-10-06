'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { useVote } from '@/hooks/useVote'
import { useReport, REASONS } from '@/hooks/useReport'
import { useVerify } from '@/hooks/useVerify'
import { formatRelativeTime } from '@/lib/time'
import ReviewCommentsSheet from '@/features/review/ReviewCommentsSheet'
import type { ReviewItem } from '@/hooks/useReviewQueue'

export type ReviewSheet = 'comments' | 'report' | null

interface Stamp {
  id: number
  label: string
  tone: keyof typeof STAMP_TONES
}

const STAMP_TONES = {
  up: 'text-green-safe border-green-safe',
  down: 'text-red-hazard border-red-hazard',
  removed: 'text-white border-white/70',
  still: 'text-green-safe border-green-safe',
  fixed: 'text-red-hazard border-red-hazard',
  reported: 'text-amber-warn border-amber-warn',
} as const

function RailButton({
  label,
  count,
  active,
  activeClass,
  activeCaptionClass,
  disabled,
  onClick,
  children,
}: {
  label: string
  count?: number
  active?: boolean
  activeClass?: string
  activeCaptionClass?: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        className={`flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-sm transition-all hover:scale-105 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50 ${
          active && activeClass
            ? activeClass
            : 'border-white/15 bg-black/45 text-white/85 hover:bg-black/65'
        }`}
      >
        {children}
      </button>
      <span
        className={`flex items-baseline gap-1 font-mono text-[8px] font-medium uppercase leading-none tracking-[0.14em] ${
          active && activeCaptionClass ? activeCaptionClass : 'text-white/55'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        {label}
        {count != null && count > 0 && (
          <span className="text-[10px] font-semibold tracking-normal">{count}</span>
        )}
      </span>
    </div>
  )
}

export function ReviewCard({
  item,
  active,
  onAction,
  sectionRef,
  sheet,
  onSheetChange,
}: {
  item: ReviewItem
  active: boolean
  onAction: () => void
  sectionRef?: (el: HTMLElement | null) => void
  sheet: ReviewSheet
  onSheetChange: (s: ReviewSheet) => void
}) {
  const contentType = item.kind
  const contentId = String(item.id)

  const { votes, loading: voteLoading, voting, error: voteError, vote } = useVote({
    contentType,
    contentId,
    initialVotes: { upvotes: item.upvotes, downvotes: item.downvotes, userVote: item.userVote },
  })
  const {
    reported,
    loading: reportLoading,
    error: reportError,
    report,
    unreport,
  } = useReport({ contentType, contentId, enabled: active })
  const { stillCount, fixedCount, posting, verify } = useVerify({
    contentType,
    contentId,
    enabled: active,
  })

  const [stamp, setStamp] = useState<Stamp | null>(null)
  const stampTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (stampTimer.current) clearTimeout(stampTimer.current)
    }
  }, [])

  const flash = (label: string, tone: keyof typeof STAMP_TONES) => {
    setStamp((prev) => ({ id: (prev?.id ?? 0) + 1, label, tone }))
    if (stampTimer.current) clearTimeout(stampTimer.current)
    stampTimer.current = setTimeout(() => setStamp(null), 850)
    onAction()
  }

  const doVote = async (value: 1 | -1) => {
    const outcome = await vote(value)
    if (outcome === 'up') flash('Upvoted', 'up')
    else if (outcome === 'down') flash('Downvoted', 'down')
    else if (outcome === 'removed') flash('Vote removed', 'removed')
    else onAction()
  }

  const doVerify = async (signal: 'still' | 'fixed') => {
    await verify(signal)
    flash(signal === 'still' ? 'Still here' : 'Fixed', signal)
  }

  const submitReport = async (reason: string) => {
    const ok = await report(reason)
    if (ok) {
      onSheetChange(null)
      flash('Reported', 'reported')
    }
  }

  const toggleReport = async () => {
    if (reported) {
      const ok = await unreport()
      if (ok) onAction()
    } else {
      onSheetChange('report')
    }
  }

  // Keyboard: ← downvote, ↑↓ handled by the page, Escape closes any sheet
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sheet) {
        onSheetChange(null)
        return
      }
      if (sheet) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        doVote(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        doVote(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, sheet, votes.userVote, voting, onSheetChange])

  const reporterName =
    item.reporter ?? (item.kind === 'pothole' ? 'Auto-detected' : 'Anonymous')

  return (
    <section
      ref={sectionRef}
      className="flex h-full w-full snap-start items-center justify-center"
      aria-label={item.eyebrow}
    >
      <div className="relative h-full w-full max-w-[480px] overflow-hidden border-x border-border bg-surface">
        {/* Media */}
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-red-hazard/5">
            <svg className="h-12 w-12 text-red-hazard/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/55" />

        {/* Eyebrow */}
        <div className="absolute left-4 right-20 top-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-white/75">
            {item.eyebrow}
          </span>
          {item.severity && <Badge severity={item.severity} size="sm" />}
        </div>

        {/* Action rail */}
        <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-2.5">
          <RailButton
            label="Upvote"
            count={votes.upvotes}
            active={votes.userVote === 1}
            activeClass="border-green-safe/60 bg-green-safe/25 text-green-safe"
            activeCaptionClass="text-green-safe"
            disabled={voteLoading || voting}
            onClick={() => doVote(1)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </RailButton>
          <RailButton
            label="Downvote"
            count={votes.downvotes}
            active={votes.userVote === -1}
            activeClass="border-red-hazard/60 bg-red-hazard/25 text-red-hazard"
            activeCaptionClass="text-red-hazard"
            disabled={voteLoading || voting}
            onClick={() => doVote(-1)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </RailButton>
          <RailButton
            label="Comment"
            onClick={() => onSheetChange('comments')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
          </RailButton>
          <RailButton
            label="Still here"
            count={stillCount}
            active={false}
            activeClass="border-green-safe/60 bg-green-safe/25 text-green-safe"
            disabled={posting !== null}
            onClick={() => doVerify('still')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </RailButton>
          <RailButton
            label="Fixed"
            count={fixedCount}
            active={false}
            activeClass="border-red-hazard/60 bg-red-hazard/25 text-red-hazard"
            disabled={posting !== null}
            onClick={() => doVerify('fixed')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </RailButton>
          <RailButton
            label={reported ? 'Undo report' : 'Report'}
            active={reported}
            activeClass="border-red-hazard/60 bg-red-hazard/25 text-red-hazard"
            activeCaptionClass="text-red-hazard"
            disabled={reportLoading}
            onClick={toggleReport}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
          </RailButton>
        </div>

        {/* Verdict stamp (signature moment) */}
        {stamp && (
          <div
            key={stamp.id}
            className="animate-stamp pointer-events-none absolute inset-x-0 top-[36%] z-20 flex justify-center"
            aria-hidden
          >
            <span
              className={`rotate-[-7deg] border-[3px] px-5 py-2 font-mono text-2xl font-black uppercase tracking-[0.22em] outline outline-2 outline-offset-[6px] sm:text-3xl ${STAMP_TONES[stamp.tone]}`}
            >
              {stamp.label}
            </span>
          </div>
        )}

        {/* Inline action errors */}
        {(voteError || reportError) && (
          <span
            role="alert"
            className="absolute right-16 top-1/2 z-10 -translate-y-1/2 whitespace-nowrap rounded-md border border-red-hazard/40 bg-black/70 px-2 py-1 text-[10px] font-medium text-red-hazard"
          >
            {voteError || reportError}
          </span>
        )}

        {/* Meta */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/65">
              {item.detail}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-semibold leading-snug text-white">{item.address}</p>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-white/60">
            <span className="font-medium text-white/85">{reporterName}</span>
            <span aria-hidden>·</span>
            <span className="font-mono">{item.time ? formatRelativeTime(item.time) : ''}</span>
            <a
              href={item.href}
              className="ml-auto rounded-md px-2 py-0.5 font-medium text-cyan-accent transition-colors hover:bg-white/10 hover:text-cyan-hover"
            >
              Details
            </a>
          </div>
        </div>

        {/* Report sheet */}
        {sheet === 'report' && (
          <div
            className="absolute inset-0 z-30 flex items-end bg-black/60"
            onClick={() => onSheetChange(null)}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div
              className="w-full rounded-t-2xl border-t border-border bg-surface p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Report this content"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                  Report this content
                </span>
                <button
                  type="button"
                  onClick={() => onSheetChange(null)}
                  aria-label="Close report sheet"
                  className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-1">
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => submitReport(r.value)}
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              {reportError && (
                <p role="alert" className="mt-2 text-xs font-medium text-red-hazard">
                  {reportError}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Comments sheet */}
        <ReviewCommentsSheet
          open={sheet === 'comments'}
          potholeId={item.kind === 'pothole' ? item.id : null}
          photoId={item.kind === 'photo' ? item.id : null}
          onClose={() => onSheetChange(null)}
          onCommented={onAction}
        />
      </div>
    </section>
  )
}
