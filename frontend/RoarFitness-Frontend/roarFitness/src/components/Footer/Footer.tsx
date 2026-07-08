import type { NavItem } from '../Navbar/constants'
import { AppLink } from '../common/AppLink'
import { CONTACT_ADDRESS, CONTACT_DETAILS } from '../Contact/constants'
import { ROUTES } from '../../routes/paths'
import { FooterBrand } from './FooterBrand'
import {
  FOOTER_COPY,
  FOOTER_LEGAL_LINKS,
  FOOTER_NAV_LINKS,
  FOOTER_SOCIAL_LINKS,
} from './constants'

const footerLinkClassName =
  'text-[13px] text-features-body transition-colors duration-300 hover:text-white sm:text-sm'

function FooterNavLink({ item }: { item: NavItem }) {
  return (
    <AppLink to={item.to} href={item.href} className={footerLinkClassName}>
      {item.label}
    </AppLink>
  )
}

/**
 * Site footer — dark editorial band with brand, navigation, and contact.
 */
export function Footer() {
  const phone = CONTACT_DETAILS.find((d) => d.id === 'phone')
  const email = CONTACT_DETAILS.find((d) => d.id === 'email')

  return (
    <footer
      className="relative overflow-hidden bg-features-bg font-sans text-white"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>

      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[90rem] px-5 py-9 sm:px-8 sm:py-10 lg:px-12 lg:py-11">
        <div className="grid grid-cols-1 gap-7 border-b border-white/[0.08] pb-7 lg:grid-cols-12 lg:items-start lg:gap-7">
          <div className="lg:col-span-4">
            <FooterBrand />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:col-span-8">
              <nav aria-label={FOOTER_COPY.navigateLabel} className="px-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-features-muted sm:text-[11px]">
                  {FOOTER_COPY.navigateLabel}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {FOOTER_NAV_LINKS.map((link) => (
                    <li key={link.label}>
                      <FooterNavLink item={link} />
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="px-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-features-muted sm:text-[11px]">
                  {FOOTER_COPY.contactLabel}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  <li>
                    <address className="not-italic">
                      <AppLink to={ROUTES.contact} className={footerLinkClassName}>
                        {CONTACT_ADDRESS.line1}
                        <br />
                        {CONTACT_ADDRESS.line2}
                      </AppLink>
                    </address>
                  </li>
                  {phone?.href && (
                    <li>
                      <AppLink href={phone.href} className={footerLinkClassName}>
                        {phone.value}
                      </AppLink>
                    </li>
                  )}
                  {email?.href && (
                    <li>
                      <AppLink href={email.href} className={footerLinkClassName}>
                        {email.value}
                      </AppLink>
                    </li>
                  )}
                </ul>
              </div>

              <div className="px-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-features-muted sm:text-[11px]">
                  {FOOTER_COPY.followLabel}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {FOOTER_SOCIAL_LINKS.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        className="group inline-flex items-center text-[13px] text-features-body transition-colors duration-300 hover:text-white sm:text-sm"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-features-muted sm:text-xs">
            {FOOTER_COPY.copyright}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-[10px] font-semibold uppercase tracking-[0.14em] text-features-muted transition-colors duration-300 hover:text-white sm:text-[11px]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
