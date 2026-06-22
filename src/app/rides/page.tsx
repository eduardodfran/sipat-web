'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import RideManager from '@/features/rides/components/RideManager'

export default function RidesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0c14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0c0c14]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Ride Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Track uploads, monitor ML processing, and manage recordings
          </p>
        </div>
        <RideManager />
      </main>
    </div>
  )
}
