'use client'

import { useCallback, useEffect, useSyncExternalStore, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useReviewQueue } from '@/hooks/useReviewQueue'
import { ReviewCard } from '@/features/review/ReviewCard'
import { Skeleton } from '@/components/ui/Skeleton'

const COACH_KEY = 'sipat_review_coach_seen'

// Coach dismissal is external state (localStorage), read via useSyncExternalStore
let sessionDismissed = false
const coachListeners = new Set<() => void>()

function readCoachSeen(): boolean {
  if (sessionDismissed) return true
  try {
    return localStorage.getItem(COACH_KEY) === '1'
  } catch {
    return true
  }
}

function subscribeCoach(cb: () => void) {
  coachListeners.add(cb)
  return () => {
    coachListeners.delete(cb)
  }
}

function markCoachSeen() {
  sessionDismissed = true
  try {
    localStorage.setItem(COACH_KEY, '1')
  } catch {
    /* private mode — sessionDismissed still hides it */
  }
  coachListeners.forEach((cb) => cb())
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function ReviewPage() {
  const { user, loading: authLoading } = useAuth()
  const signedIn = !!user
  const { items, loading, error, hasMore, loadMore, retry } = useReviewQueue(signedIn)

  const [activeIndex, setActiveIndex] = useState(0)
  const coachSeen = useSyncExternalStore(subscribeCoach, readCoachSeen, () => true)
  const [toast, setToast] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const scrollRaf = useRef<number | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stamplessRef = useRef(new Set<string>()) // items skipped without any action
  const actedRef = useRef(new Set<string>()) // items the user acted on
  const prevIndexRef = useRef(0)

  useEffect(() => {
    return () => {
      if (scrollRaf.current != null) cancelAnimationFrame(scrollRaf.current)
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  const dismissCoach = useCallback(() => {
    markCoachSeen()
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }, [])

  const handleAction = useCallback(
    (key: string) => {
      actedRef.current.add(key)
      stamplessRef.current.delete(key)
      if (!coachSeen) dismissCoach()
    },
    [coachSeen, dismissCoach],
  )

  const goTo = useCallback((index: number) => {
    const el = cardRefs.current[index]
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }, [])

  // Track the active card while the user swipes / scrolls the deck
  const onScroll = useCallback(() => {
    if (scrollRaf.current != null) return
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = null
      const el = containerRef.current
      if (!el || el.clientHeight === 0) return
      const idx = Math.round(el.scrollTop / el.clientHeight)
      setActiveIndex(Math.min(Math.max(idx, 0), Math.max(items.length - 1, 0)))
    })
  }, [items.length])

  // On card change: count skips, nudge, prefetch, keyboard-driven navigation side effects
  useEffect(() => {
    const prev = prevIndexRef.current
    prevIndexRef.current = activeIndex
    if (activeIndex === prev) return

    const prevItem = items[prev]
    if (prevItem && !actedRef.current.has(prevItem.key)) {
      stamplessRef.current.add(prevItem.key)
      const skipped = stamplessRef.current.size
      if (skipped === 3 || (skipped > 3 && (skipped - 3) % 5 === 0)) {
        showToast('Vote to help others fix roads')
      }
    }

    if (hasMore && activeIndex >= items.length - 5) void loadMore()
  }, [activeIndex, items, hasMore, loadMore, showToast])

  // Page-level keyboard: ↑ / ↓ move between cards (cards handle ← / → themselves)
  useEffect(() => {
    if (!signedIn) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        goTo(activeIndex + 1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        goTo(activeIndex - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [signedIn, activeIndex, goTo])

  // Signed-out wall (after auth has resolved)
  if (!authLoading && !signedIn) {
    return (
      <div className="flex min-h-screen flex-col bg-asphalt">
        <main className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-md text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-accent">
              Review queue
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-text-primary">
              Sign in to start reviewing
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              One hazard at a time — swipe through the roads your city is reporting and cast your
              verdict. Your votes decide what officials see first.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center rounded-lg bg-cyan-accent px-5 py-2.5 text-sm font-semibold text-asphalt transition-colors hover:bg-cyan-hover"
            >
              Sign in
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const showSkeleton = signedIn && loading
  const showFatalError = signedIn && !!error && items.length === 0
  const showEnd = signedIn && !loading && !showFatalError && items.length > 0 && !hasMore

  return (
    <div className="relative bg-asphalt">
      {showFatalError ? (
        <div className="flex h-[calc(100dvh-4rem)] items-center justify-center px-6">
          <div className="max-w-sm text-center">
            <p className="text-sm font-medium text-text-primary">Couldn&apos;t load the queue</p>
            <p className="mt-1 text-xs text-text-muted">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-hover"
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          onScroll={onScroll}
          className="h-[calc(100dvh-4rem)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
        >
          {showSkeleton ? (
            <div className="flex h-full w-full snap-start items-center justify-center">
              <div className="w-full max-w-[480px] px-4">
                <Skeleton className="h-[70vh] w-full rounded-xl" />
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          ) : (
            <>
              {items.map((item, i) => (
                <ReviewCard
                  key={item.key}
                  item={item}
                  active={signedIn && i === activeIndex}
                  onAction={() => handleAction(item.key)}
                  sectionRef={(el) => {
                    cardRefs.current[i] = el
                  }}
                />
              ))}

              {showEnd && (
                <section
                  ref={(el) => {
                    cardRefs.current[items.length] = el
                  }}
                  className="flex h-full w-full snap-start items-center justify-center px-6"
                >
                  <div className="max-w-sm text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-green-safe/40 bg-green-safe/10">
                      <svg
                        className="h-7 w-7 text-green-safe"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <h2 className="mt-5 text-xl font-bold tracking-tight text-text-primary">
                      You&apos;ve reviewed everything
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      New detections appear as the community reports them. Check back later, or
                      browse what&apos;s trending in the feed.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <Link
                        href="/feed"
                        className="rounded-lg bg-cyan-accent px-4 py-2 text-sm font-semibold text-asphalt transition-colors hover:bg-cyan-hover"
                      >
                        Open feed
                      </Link>
                      <Link
                        href="/map"
                        className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover"
                      >
                        View map
                      </Link>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}

      {/* Coach mark — anchored to the card column, points at the action rail */}
      {!showSkeleton && !showFatalError && signedIn && !coachSeen && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-40 mx-auto h-full max-w-[480px]">
          <div className="pointer-events-auto absolute right-3 top-1/2 w-44 -translate-y-1/2 rounded-xl border border-border bg-surface p-3 shadow-xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-accent">
              Your call
            </p>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              Vote, then swipe up for the next one. Tap the arrow keys on desktop.
            </p>
            <button
              type="button"
              onClick={dismissCoach}
              className="mt-2 w-full rounded-lg bg-cyan-accent px-3 py-1.5 text-xs font-semibold text-asphalt transition-colors hover:bg-cyan-hover"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Soft nudge toast */}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-6">
          <p className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-text-secondary shadow-lg">
            {toast}
          </p>
        </div>
      )}
    </div>
  )
}
