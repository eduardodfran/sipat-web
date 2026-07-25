import { Navbar } from '@/components/layout/Navbar'
import FeedPage from '@/features/feed/components/FeedPage'

export default function FeedRoute() {
  return (
    <div className="min-h-screen bg-asphalt">
      <Navbar />
      <main>
        <FeedPage />
      </main>
    </div>
  )
}
