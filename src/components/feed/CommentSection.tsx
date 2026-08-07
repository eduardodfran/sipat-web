'use client'

import { useEffect, useRef, useState } from 'react'
import { useDetectionComments } from '@/hooks/useDetectionComments'
import { useCommunityPhotoComments } from '@/hooks/useCommunityPhotoComments'
import { useAuth } from '@/contexts/AuthContext'
import { validateComment, MAX_COMMENT_LENGTH, COMMENT_COOLDOWN_MS } from '@/lib/spamDetection'

interface CommentSectionProps {
  potholeId?: number | null
  photoId?: number | null
  commentCount: number
}

function formatTime(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function CommentItem({ comment }: { comment: { body: string; created_at: string; username: string | null } }) {
  const isVerify = comment.body.startsWith('✅')
  const initial = (comment.username ?? '?')[0].toUpperCase()
  return (
    <div className={`flex gap-2.5 ${isVerify ? 'opacity-70' : ''}`}>
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-raised text-[10px] font-bold text-text-muted">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold text-text-primary">{comment.username ?? 'Anonymous'}</span>
          <span className="text-[10px] text-text-muted">{formatTime(comment.created_at)}</span>
        </div>
        <p className={`mt-0.5 text-[12px] leading-relaxed ${isVerify ? 'text-green-safe' : 'text-text-secondary'}`}>
          {comment.body}
        </p>
      </div>
    </div>
  )
}

export default function CommentSection({ potholeId, photoId, commentCount }: CommentSectionProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const potholeComments = useDetectionComments(potholeId ?? null)
  const photoComments = useCommunityPhotoComments(photoId ?? null)

  const isPothole = potholeId != null
  const { comments, loading, posting, postComment } = isPothole ? potholeComments : photoComments

  useEffect(() => {
    if (cooldown <= 0) return
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current) }
  }, [cooldown > 0])

  const handlePost = async () => {
    if (!input.trim() || cooldown > 0) return
    setError('')

    const result = validateComment(input)
    if (!result.ok) {
      setError(result.error!)
      return
    }

    await postComment(input)
    setInput('')
    setCooldown(COMMENT_COOLDOWN_MS / 1000)
  }

  if (commentCount === 0 && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[11px] font-medium text-text-muted transition-colors hover:text-text-secondary"
      >
        Comment
      </button>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[11px] font-medium text-text-muted transition-colors hover:text-text-secondary"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
        </svg>
        {open ? 'Hide' : `${commentCount} comment${commentCount !== 1 ? 's' : ''}`}
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {loading && (
            <div className="flex justify-center py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
            </div>
          )}

          {!loading && comments.length === 0 && (
            <p className="py-2 text-center text-[11px] text-text-muted">No comments yet</p>
          )}

          {!loading && comments.length > 0 && (
            <div className="max-h-48 space-y-2.5 overflow-y-auto">
              {comments.map((c) => (
                <CommentItem key={c.id} comment={c} />
              ))}
            </div>
          )}

          {user ? (
            <div className="space-y-1.5">
              {error && (
                <p className="text-[11px] text-red-400">{error}</p>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePost()}
                  placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : 'Write a comment...'}
                  maxLength={MAX_COMMENT_LENGTH}
                  className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-[12px] text-text-primary placeholder-text-muted outline-none transition-colors focus:border-cyan-accent/50"
                />
                <button
                  onClick={handlePost}
                  disabled={posting || !input.trim() || cooldown > 0}
                  className="rounded-lg bg-cyan-accent px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-cyan-hover disabled:opacity-50"
                >
                  {posting ? '...' : cooldown > 0 ? `${cooldown}s` : 'Send'}
                </button>
              </div>
              <div className="flex justify-end">
                <span className={`text-[10px] ${input.length > MAX_COMMENT_LENGTH * 0.9 ? 'text-amber-400' : 'text-text-muted'}`}>
                  {input.length}/{MAX_COMMENT_LENGTH}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-text-muted">Sign in to comment</p>
          )}
        </div>
      )}
    </div>
  )
}
