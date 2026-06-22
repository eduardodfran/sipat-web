import { Navbar } from '@/components/layout/Navbar'
import Dashboard from './Dashboard'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0c0c14]">
      <Navbar />
      <Dashboard />
    </div>
  )
}
