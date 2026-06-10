import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a1a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div>
              <Skeleton className="mb-1 h-5 w-20" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="mx-auto max-w-7xl px-6 pt-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[72px] rounded-xl" />
          ))}
        </div>

        {/* Map skeleton */}
        <Skeleton className="mt-6 h-[500px] rounded-2xl" />
      </div>
    </div>
  )
}
