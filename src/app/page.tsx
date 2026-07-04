import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/features/landing/components/Hero'
import { Features } from '@/features/landing/components/Features'
import { Stats } from '@/features/landing/components/Stats'
import { CTABanner } from '@/features/landing/components/CTABanner'
import { Footer } from '@/features/landing/components/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-asphalt">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Stats />
        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
