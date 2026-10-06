'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface VoteState {
  upvotes: number
  downvotes: number
  userVote: 0 | 1 | -1
}

export function VoteButtons({
  contentType,
  contentId,
  user,
  initialVotes,
}: {
  contentType: 'photo' | 'pothole'
  contentId: string
  user?: { email?: string } | null
  initialVotes?: VoteState
}) {
  const { user: authUser, loading: authLoading } = useAuth()
  const activeUser = user ?? authUser

  const seeded = useRef(initialVotes !== undefined)
  const [votes, setVotes] = useState<VoteState>(initialVotes ?? { upvotes: 0, downvotes: 0, userVote: 0 })
  const [loading, setLoading] = useState(initialVotes === undefined)
  const [voting, setVoting] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (errorTimer.current) clearTimeout(errorTimer.current)
    }
  }, [])

  useEffect(() => {
    if (seeded.current) return
    let cancelled = false
    ;(async () => {
      const { data } = await supabase.rpc('get_content_votes', {
        p_content_type: contentType,
        p_content_id: contentId,
      })
      if (!cancelled && data) {
        const row = Array.isArray(data) ? data[0] : data
        setVotes({
          upvotes: row.upvotes ?? 0,
          downvotes: row.downvotes ?? 0,
          userVote: row.user_vote ?? 0,
        })
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [contentType, contentId])

  const showVoteError = useCallback((message: string) => {
    setVoteError(message)
    if (errorTimer.current) clearTimeout(errorTimer.current)
    errorTimer.current = setTimeout(() => setVoteError(null), 3000)
  }, [])

  const vote = useCallback(
    async (value: 1 | -1) => {
      if (voting) return
      const sameVote = votes.userVote === value
      const rpc = sameVote ? 'unvote_content' : 'vote_content'
      const params = sameVote
        ? { p_content_type: contentType, p_content_id: contentId }
        : { p_content_type: contentType, p_content_id: contentId, p_vote_value: value }
      setVoting(true)
      const { data, error } = await supabase.rpc(rpc, params)
      setVoting(false)
      if (error) {
        showVoteError('Vote failed')
        return
      }
      if (data) {
        const row = Array.isArray(data) ? data[0] : data
        setVotes({
          upvotes: row.upvotes ?? 0,
          downvotes: row.downvotes ?? 0,
          userVote: sameVote ? 0 : value,
        })
      }
    },
    [contentType, contentId, votes.userVote, voting, showVoteError],
  )

  const score = votes.upvotes - votes.downvotes

  if (!activeUser) {
    if (authLoading) {
      return (
        <div className="flex items-center gap-1.5 opacity-50" aria-busy="true">
          <svg className="h-4 w-4 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
          <span className="min-w-[1.5rem] text-center text-xs font-semibold text-text-muted">{score}</span>
          <svg className="h-4 w-4 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1.5">
        <svg className="h-4 w-4 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
        <span className="min-w-[1.5rem] text-center text-xs font-semibold text-text-muted">{score}</span>
        <svg className="h-4 w-4 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
        <a href="/login" className="ml-1 text-[10px] font-medium text-cyan-accent hover:underline">Sign in to vote</a>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => vote(1)}
        disabled={loading || voting}
        className={`rounded-md p-1 transition-colors ${
          votes.userVote === 1
            ? 'bg-green-safe/20 text-green-safe'
            : 'text-text-muted hover:bg-surface-hover hover:text-green-safe'
        }`}
        aria-label="Upvote"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
      <span
        className={`min-w-[1.5rem] text-center text-xs font-semibold ${
          score > 0 ? 'text-green-safe' : score < 0 ? 'text-red-hazard' : 'text-text-muted'
        }`}
      >
        {score}
      </span>
      <button
        onClick={() => vote(-1)}
        disabled={loading || voting}
        className={`rounded-md p-1 transition-colors ${
          votes.userVote === -1
            ? 'bg-red-hazard/20 text-red-hazard'
            : 'text-text-muted hover:bg-surface-hover hover:text-red-hazard'
        }`}
        aria-label="Downvote"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {voteError && (
        <span className="ml-0.5 text-[10px] font-medium text-red-hazard" role="alert">
          {voteError}
        </span>
      )}
    </div>
  )
}
