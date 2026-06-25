import { Navbar } from '@/components/layout/Navbar'
import { RoadBackground } from '@/components/ui/RoadBackground'
import Dashboard from './Dashboard'

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-asphalt text-white">
      <RoadBackground />
      <div className="relative z-10">
        <Navbar />
        <Dashboard />
      </div>
    </div>
  )
}
