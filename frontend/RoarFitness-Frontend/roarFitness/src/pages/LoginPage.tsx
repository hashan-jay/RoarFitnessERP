import { LoginBrandPanel } from '../components/Login/LoginBrandPanel'
import { LoginForm } from '../components/Login/LoginForm'

/**
 * Distraction-free authentication — split editorial layout, no site chrome.
 */
export function LoginPage() {
  return (
    <div className="min-h-screen bg-surface font-sans text-brand-ink lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <LoginBrandPanel />

      <main className="relative flex min-h-[calc(100vh-12rem)] flex-col justify-center px-5 py-10 sm:px-10 sm:py-12 lg:min-h-screen lg:px-14 lg:py-16 xl:px-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(10,10,10,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,10,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_80%_20%,black_10%,transparent_65%)] lg:hidden"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-[22rem] sm:max-w-md">
          <LoginForm />
        </div>
      </main>
    </div>
  )
}
