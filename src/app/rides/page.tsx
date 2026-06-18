import { Navbar } from '@/components/layout/Navbar'
import RideManager from '@/features/rides/components/RideManager'

export default function RidesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a]">
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
