'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useVote, type VoteState } from '@/hooks/useVote'

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

  const { votes, loading, voting, error: voteError, vote } = useVote({
    contentType,
    contentId,
    initialVotes,
  })

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
