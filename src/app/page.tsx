import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/features/landing/components/Hero'
import { Features } from '@/features/landing/components/Features'
import { SocialProof } from '@/features/landing/components/SocialProof'
import { HowItWorks } from '@/features/landing/components/HowItWorks'
import { LiveMapPreview } from '@/features/landing/components/LiveMapPreview'
import { Stats } from '@/features/landing/components/Stats'
import { FAQ } from '@/features/landing/components/FAQ'
import { CTABanner } from '@/features/landing/components/CTABanner'
import { Footer } from '@/features/landing/components/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-asphalt">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <SocialProof />
        <HowItWorks />
        <LiveMapPreview />
        <Stats />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
