import { Navbar } from '@/components/layout/Navbar'
import Dashboard from '@/app/Dashboard'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-asphalt">
      <div className="relative z-10">
        <Navbar />
        <Dashboard />
      </div>
    </div>
  )
}
