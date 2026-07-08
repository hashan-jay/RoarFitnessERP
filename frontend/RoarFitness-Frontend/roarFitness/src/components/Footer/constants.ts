import { NAV_LINKS } from '../Navbar/constants'

export const FOOTER_COPY = {
  tagline: 'Train with purpose. Live with power.',
  navigateLabel: 'Navigate',
  contactLabel: 'Contact',
  followLabel: 'Follow',
  copyright: `© ${new Date().getFullYear()} Roar Fitness. All rights reserved.`,
} as const

export const FOOTER_NAV_LINKS = NAV_LINKS

export const FOOTER_SOCIAL_LINKS = [
  { id: 'instagram', label: 'Instagram', href: '#' },
  { id: 'facebook', label: 'Facebook', href: '#' },
  { id: 'youtube', label: 'YouTube', href: '#' },
] as const

export const FOOTER_LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Use', href: '#' },
] as const
