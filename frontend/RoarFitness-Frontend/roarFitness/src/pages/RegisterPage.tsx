import { RegisterForm } from '../components/Register/RegisterForm'
import { RegisterHero } from '../components/Register/RegisterHero'

/**
 * Register page — top hero band + overlapping stepped form card.
 * Visually distinct from login's split-screen layout.
 */
export function RegisterPage() {
  return (
    <div className="min-h-screen bg-surface font-sans text-brand-ink">
      <RegisterHero />

      <main className="relative px-5 pb-12 sm:px-8 sm:pb-16 lg:pb-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(10,10,10,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,10,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_50%_0%,black_8%,transparent_60%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto -mt-10 max-w-2xl sm:-mt-12">
          <RegisterForm />
        </div>
      </main>
    </div>
  )
}
