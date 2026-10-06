'use client'

import { useEffect, useState } from 'react'
import { useDetectionComments } from '@/hooks/useDetectionComments'
import { useCommunityPhotoComments } from '@/hooks/useCommunityPhotoComments'
import { validateComment, MAX_COMMENT_LENGTH, COMMENT_COOLDOWN_MS } from '@/lib/spamDetection'
import { formatRelativeTime } from '@/lib/time'

interface ReviewCommentsSheetProps {
  open: boolean
  potholeId: number | null
  photoId: number | null
  onClose: () => void
  onCommented: () => void
}

function SheetCommentItem({
  comment,
}: {
  comment: { body: string; created_at: string; username: string | null }
}) {
  const isVerify = comment.body.startsWith('✅')
  const initial = (comment.username ?? '?')[0].toUpperCase()
  return (
    <div className={`flex gap-2.5 ${isVerify ? 'opacity-70' : ''}`}>
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-raised text-[10px] font-bold text-text-muted">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold text-text-primary">
            {comment.username ?? 'Anonymous'}
          </span>
          <span className="font-mono text-[10px] text-text-muted">
            {formatRelativeTime(comment.created_at)}
          </span>
        </div>
        <p
          className={`mt-0.5 break-words text-[12px] leading-relaxed ${
            isVerify ? 'text-green-safe' : 'text-text-secondary'
          }`}
        >
          {comment.body}
        </p>
      </div>
    </div>
  )
}

export default function ReviewCommentsSheet({
  open,
  potholeId,
  photoId,
  onClose,
  onCommented,
}: ReviewCommentsSheetProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  // Hooks gated on `open` — background deck cards never fetch comments
  const potholeComments = useDetectionComments(open ? potholeId : null)
  const photoComments = useCommunityPhotoComments(open ? photoId : null)

  const isPothole = potholeId != null
  const { comments, loading, posting, postComment } = isPothole ? potholeComments : photoComments

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((prev) => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handlePost = async () => {
    if (!input.trim() || cooldown > 0 || posting) return
    setError('')
    const result = validateComment(input)
    if (!result.ok) {
      setError(result.error!)
      return
    }
    const newComment = await postComment(input)
    if (!newComment) {
      setError('Could not post — try again')
      return
    }
    setInput('')
    setCooldown(COMMENT_COOLDOWN_MS / 1000)
    onCommented()
  }

  if (!open) return null

  const count = comments.length

  return (
    <div
      className="absolute inset-0 z-30 flex items-end bg-black/60"
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      role="presentation"
    >
      <div
        className="flex max-h-[75%] w-full flex-col rounded-t-2xl border-t border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Comments"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-secondary">
            {loading ? 'Comments' : count > 0 ? `${count} comment${count !== 1 ? 's' : ''}` : 'Comments'}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments"
            className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {loading && (
            <div className="flex justify-center py-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
            </div>
          )}

          {!loading && count === 0 && (
            <p className="py-4 text-center text-[11px] text-text-muted">
              No comments yet — start the thread
            </p>
          )}

          {!loading && count > 0 && (
            <div className="space-y-3">
              {comments.map((c) => (
                <SheetCommentItem key={c.id} comment={c} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border px-4 py-3">
          {error && (
            <p role="alert" className="mb-1.5 text-[11px] font-medium text-red-400">
              {error}
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handlePost()}
              placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : 'Write a comment...'}
              maxLength={MAX_COMMENT_LENGTH}
              className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-[12px] text-text-primary placeholder-text-muted outline-none transition-colors focus:border-cyan-accent/50"
            />
            <button
              type="button"
              onClick={handlePost}
              disabled={posting || !input.trim() || cooldown > 0}
              className="rounded-lg bg-cyan-accent px-3 py-1.5 text-[11px] font-semibold text-asphalt transition-colors hover:bg-cyan-hover disabled:opacity-50"
            >
              {posting ? '...' : cooldown > 0 ? `${cooldown}s` : 'Send'}
            </button>
          </div>
          <div className="mt-1 flex justify-end">
            <span
              className={`text-[10px] ${
                input.length > MAX_COMMENT_LENGTH * 0.9 ? 'text-amber-400' : 'text-text-muted'
              }`}
            >
              {input.length}/{MAX_COMMENT_LENGTH}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
