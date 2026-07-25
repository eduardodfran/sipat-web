'use client'

import { useMemo } from 'react'
import { useServerData } from './useServerData'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'

const PHOTO_PARAMS = (userId: string) => ({
  table: 'community_photos',
  columns: '*',
  order: { column: 'created_at', ascending: false } as const,
  limit: 50,
  filters: [{ column: 'user_id', operator: 'eq', value: userId }],
})

export function useUserPhotos(userId: string | undefined) {
  const params = useMemo(() => (userId ? PHOTO_PARAMS(userId) : null), [userId])
  const { data, loading, error, refetch } = useServerData<Record<string, unknown>[]>(
    params ?? { table: 'community_photos', limit: 0 },
  )

  const photos = useMemo(
    () => (userId && data ? (data as unknown as CommunityPhoto[]) : []),
    [data, userId],
  )

  return { photos, loading: userId ? loading : false, error, refetch }
}
