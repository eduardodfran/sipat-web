'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface PhotoComment {
  id: string
  body: string
  created_at: string
  username: string | null
  user_id: string | null
}

export function useCommunityPhotoComments(photoId: number | null) {
  const [comments, setComments] = useState<PhotoComment[]>([])
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState(false)

  const fetchComments = useCallback(() => {
    if (photoId === null) {
      setComments([])
      return
    }

    let cancelled = false
    setLoading(true)

    ;(async () => {
      try {
        const { data, error } = await supabase.rpc('get_community_photo_comments', { p_photo_id: photoId })
        if (cancelled) return
        setLoading(false)
        if (error) {
          console.error('Failed to fetch photo comments:', JSON.stringify(error, null, 2))
          return
        }
        setComments((data ?? []) as PhotoComment[])
      } catch (err) {
        if (cancelled) return
        setLoading(false)
        console.error('Photo comments RPC exception:', err)
      }
    })()

    return () => { cancelled = true }
  }, [photoId])

  useEffect(() => {
    const cleanup = fetchComments()
    return cleanup
  }, [fetchComments])

  const postComment = useCallback(async (body: string) => {
    if (photoId === null || !body.trim()) return null

    setPosting(true)
    try {
      const { data, error } = await supabase
        .rpc('create_community_photo_comment', { p_photo_id: photoId, p_body: body.trim() })

      if (error) {
        console.error('Failed to post photo comment:', JSON.stringify(error, null, 2))
        return null
      }

      const newComment = (data as PhotoComment[])?.[0] ?? null
      if (newComment) {
        setComments((prev) => [...prev, newComment])
      }
      return newComment
    } catch (err) {
      console.error('Post photo comment exception:', err)
      return null
    } finally {
      setPosting(false)
    }
  }, [photoId])

  return { comments, loading, posting, postComment }
}
