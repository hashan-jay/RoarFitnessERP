import { Outlet } from 'react-router-dom'

import { Contact } from '../components/Contact'
import { Features } from '../components/Features'
import { Footer } from '../components/Footer'
import { Hero } from '../components/Hero'
import { Classes } from '../components/Classes'
import { MembershipPlans } from '../components/MembershipPlans'
import { Showcase } from '../components/Showcase'
import { Testimonials } from '../components/Testimonials'
import { Trainers } from '../components/Trainers'

export function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <Features />
        <Showcase />
        <Classes />
        <MembershipPlans />
        <Trainers />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <Outlet />
    </>
  )
}
