import { AboutCtaBanner } from '../components/AboutPage/AboutCtaBanner'
import {
  AboutJourney,
  AboutMission,
  AboutStatsBand,
  AboutValues,
} from '../components/AboutPage/AboutSections'
import { AboutHero } from '../components/AboutPage/AboutHero'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-surface font-sans text-brand-ink">
      <Navbar />

      <main>
        <AboutHero />
        <AboutStatsBand />
        <AboutMission />
        <AboutValues />
        <AboutJourney />
        <AboutCtaBanner />
      </main>

      <Footer />
    </div>
  )
}
