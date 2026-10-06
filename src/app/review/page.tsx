import { Navbar } from '@/components/layout/Navbar'
import ReviewPage from '@/features/review/ReviewPage'

export default function ReviewRoute() {
  return (
    <div className="min-h-screen bg-asphalt">
      <Navbar />
      <main>
        <ReviewPage />
      </main>
    </div>
  )
}
