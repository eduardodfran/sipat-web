'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface VoteState {
  upvotes: number
  downvotes: number
  userVote: 0 | 1 | -1
}

export function VoteButtons({
  contentType,
  contentId,
}: {
  contentType: 'photo' | 'pothole'
  contentId: string
}) {
  const [votes, setVotes] = useState<VoteState>({ upvotes: 0, downvotes: 0, userVote: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  const vote = useCallback(
    async (value: 1 | -1) => {
      const sameVote = votes.userVote === value
      const rpc = sameVote ? 'unvote_content' : 'vote_content'
      const params = sameVote
        ? { p_content_type: contentType, p_content_id: contentId }
        : { p_content_type: contentType, p_content_id: contentId, p_vote_value: value }
      const { data } = await supabase.rpc(rpc, params)
      if (data) {
        const row = Array.isArray(data) ? data[0] : data
        setVotes({
          upvotes: row.upvotes ?? 0,
          downvotes: row.downvotes ?? 0,
          userVote: sameVote ? 0 : value,
        })
      }
    },
    [contentType, contentId, votes.userVote],
  )

  const score = votes.upvotes - votes.downvotes

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => vote(1)}
        disabled={loading}
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
        disabled={loading}
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
    </div>
  )
}
