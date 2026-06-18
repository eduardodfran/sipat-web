import { Navbar } from '@/components/layout/Navbar'
import Dashboard from './Dashboard'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#08080c]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-6">
        <Dashboard />
      </main>
    </div>
  )
}
