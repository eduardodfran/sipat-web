'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import {
  kindLabel,
  notificationHref,
  useNotifications,
  type AppNotification,
} from '@/hooks/useNotifications'
import { formatRelativeTime } from '@/lib/time'

const KIND_STYLE: Record<AppNotification['kind'], string> = {
  comment: 'bg-cyan-accent/15 text-cyan-accent',
  vote_milestone: 'bg-green-safe/15 text-green-safe',
  verify: 'bg-amber-warn/15 text-amber-warn',
  flip: 'bg-red-hazard/15 text-red-hazard',
}

const KIND_INITIAL: Record<AppNotification['kind'], string> = {
  comment: 'C',
  vote_milestone: '★',
  verify: '✓',
  flip: '!',
}

function NotificationRow({
  n,
  onOpen,
}: {
  n: AppNotification
  onOpen: (n: AppNotification) => void
}) {
  const title = n.actor_username ? `${n.actor_username} · ${kindLabel(n.kind)}` : kindLabel(n.kind)
  return (
    <Link
      href={notificationHref(n)}
      onClick={() => onOpen(n)}
      className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors hover:border-cyan-accent/30 ${
        n.is_read ? 'border-border bg-surface' : 'border-cyan-accent/30 bg-surface'
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${KIND_STYLE[n.kind]}`}>
        {KIND_INITIAL[n.kind]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-text-primary">{title}</p>
        {n.preview ? (
          <p className="mt-0.5 line-clamp-2 break-words text-xs leading-relaxed text-text-secondary">{n.preview}</p>
        ) : null}
        <p className="mt-1 font-mono text-[10px] text-text-muted">{formatRelativeTime(n.created_at)}</p>
      </div>
      {!n.is_read && <div className="h-2 w-2 shrink-0 rounded-full bg-cyan-accent" />}
    </Link>
  )
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const { theme, toggle } = useTheme()
  const { items, loading, markRead, markAllRead } = useNotifications(user?.id ?? '')
  const hasUnread = items.some((n) => !n.is_read)

  if (!authLoading && !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-asphalt">
        <p className="text-sm text-text-muted">Sign in to see notifications</p>
        <Link href="/login" className="text-sm text-cyan-accent hover:underline">Sign In</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-asphalt">
      <header className="sticky top-0 z-50 border-b border-border bg-asphalt/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <Link href="/feed" className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </Link>
          <h1 className="text-sm font-semibold text-text-primary">Notifications</h1>
          {hasUnread ? (
            <button onClick={markAllRead} className="text-xs font-semibold text-cyan-accent hover:underline">
              Mark all read
            </button>
          ) : (
            <button onClick={toggle} className="rounded-xl p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary" aria-label="Toggle theme">
              {theme === 'dark' ? '☾' : '☀'}
            </button>
          )}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-accent/40 to-transparent" />
      </header>

      <main className="mx-auto max-w-3xl space-y-3 px-6 py-8">
        {loading && items.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-border bg-surface py-16">
            <p className="text-sm font-medium text-text-muted">No notifications yet</p>
            <p className="mt-1 text-xs text-text-muted">Comments, milestones, and verifications on your posts will show up here.</p>
          </div>
        ) : (
          items.map((n) => <NotificationRow key={n.id} n={n} onOpen={(item) => markRead(item.id)} />)
        )}
      </main>
    </div>
  )
}
