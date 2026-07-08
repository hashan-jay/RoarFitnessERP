import { ROUTES } from '../../routes/paths'

/** Navigation link configuration */
export interface NavItem {
  label: string
  /** React Router path */
  to?: string
  /** Hash link for sections not routed yet */
  href?: string
  /** Whether to show the trailing chevron (>>) */
  showChevron?: boolean
}

export const NAV_LINKS: NavItem[] = [
  { label: 'Home', to: ROUTES.home, showChevron: true },
  { label: 'Plans', to: ROUTES.plans, showChevron: true },
  { label: 'Classes', to: ROUTES.classes, showChevron: true },
  { label: 'Trainers', to: ROUTES.trainers, showChevron: true },
  { label: 'About', to: ROUTES.about, showChevron: true },
  { label: 'Contact Us', to: ROUTES.contact, showChevron: false },
]
