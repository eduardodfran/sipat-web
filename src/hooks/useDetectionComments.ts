'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { DetectionComment } from '@/lib/types'

export function useDetectionComments(potholeId: number | null) {
  const [comments, setComments] = useState<DetectionComment[]>([])
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState(false)

  const fetchComments = useCallback(() => {
    if (potholeId === null) {
      setComments([])
      return
    }

    let cancelled = false
    setLoading(true)

    supabase
      .rpc('get_detection_comments', { p_pothole_id: potholeId })
      .then(({ data, error }) => {
        if (cancelled) return
        setLoading(false)
        if (error) {
          console.error('Failed to fetch comments:', JSON.stringify(error, null, 2))
          return
        }
        setComments((data ?? []) as DetectionComment[])
      })
      .catch((err) => {
        if (cancelled) return
        setLoading(false)
        console.error('Comments RPC exception:', err)
      })

    return () => { cancelled = true }
  }, [potholeId])

  useEffect(() => {
    const cleanup = fetchComments()
    return cleanup
  }, [fetchComments])

  const postComment = useCallback(async (body: string) => {
    if (potholeId === null || !body.trim()) return null

    setPosting(true)
    try {
      const { data, error } = await supabase
        .rpc('create_detection_comment', { p_pothole_id: potholeId, p_body: body.trim() })

      if (error) {
        console.error('Failed to post comment:', JSON.stringify(error, null, 2))
        return null
      }

      const newComment = (data as DetectionComment[])?.[0] ?? null
      if (newComment) {
        setComments((prev) => [...prev, newComment])
      }
      return newComment
    } catch (err) {
      console.error('Post comment exception:', err)
      return null
    } finally {
      setPosting(false)
    }
  }, [potholeId])

  return { comments, loading, posting, postComment }
}
