import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '../../routes/paths'
import { NAV_LINKS } from './constants'
import { Logo } from './Logo'
import { NavItemLink } from './NavItemLink'

/** Double-chevron suffix used on nav links and CTAs */
function ChevronSuffix() {
  return (
    <span
      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
      aria-hidden="true"
    >
      {' >>'}
    </span>
  )
}

interface NavbarProps {
  /** When true, hides the login CTA (e.g. already on the login page) */
  hideLogin?: boolean
}

/**
 * Sticky top navigation bar with desktop links and a mobile drawer.
 */
export function Navbar({ hideLogin = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const closeMenu = () => setIsMenuOpen(false)

  const handleLogin = () => {
    closeMenu()
    navigate(ROUTES.login)
  }

  const linkClassName =
    'group text-xs font-semibold uppercase tracking-[0.15em] text-brand-ink transition-colors hover:text-neutral-900'

  const mobileLinkClassName =
    'group flex items-center py-3 text-sm font-semibold uppercase tracking-[0.12em] text-brand-ink transition-colors hover:text-neutral-900'

  return (
    <header className="relative z-50 w-full">
      <nav
        className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto] items-center gap-4 px-5 py-6 sm:px-8 lg:px-12 xl:grid-cols-[auto_1fr_auto]"
        aria-label="Main navigation"
      >
        <Logo />

        <ul className="hidden items-center justify-center gap-6 xl:flex xl:gap-8">
          {NAV_LINKS.map((item) => (
            <li key={item.label}>
              <NavItemLink item={item} className={linkClassName}>
                {item.label}
                {item.showChevron && <ChevronSuffix />}
              </NavItemLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-self-end gap-4">
          {!hideLogin && (
            <button
              type="button"
              onClick={handleLogin}
              className="hidden border border-black px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-black transition-colors duration-300 hover:bg-black hover:text-white sm:block"
            >
              Login
            </button>
          )}

          <button
            type="button"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 xl:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span
              className={`block h-0.5 w-6 bg-black transition-all duration-300 ${
                isMenuOpen ? 'translate-y-2 rotate-45' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-black transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-black transition-all duration-300 ${
                isMenuOpen ? '-translate-y-2 -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </nav>

      <div
        id="mobile-nav"
        className={`overflow-hidden border-t border-neutral-200 bg-[#f2f2f2] transition-all duration-300 xl:hidden ${
          isMenuOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-1 px-5 py-4 sm:px-8">
          {NAV_LINKS.map((item) => (
            <li key={item.label}>
              <NavItemLink
                item={item}
                className={mobileLinkClassName}
                onClick={closeMenu}
              >
                {item.label}
                {item.showChevron && <ChevronSuffix />}
              </NavItemLink>
            </li>
          ))}
          {!hideLogin && (
            <li className="pt-2">
              <button
                type="button"
                onClick={handleLogin}
                className="w-full border border-black px-5 py-3 text-xs font-medium uppercase tracking-[0.12em] text-black transition-colors duration-300 hover:bg-black hover:text-white"
              >
                Login
              </button>
            </li>
          )}
        </ul>
      </div>
    </header>
  )
}
