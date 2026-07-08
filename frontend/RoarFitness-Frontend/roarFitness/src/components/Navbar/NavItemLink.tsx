import type { ReactNode } from 'react'

import { AppLink } from '../common/AppLink'
import type { NavItem } from './constants'

interface NavItemLinkProps {
  item: NavItem
  className: string
  onClick?: () => void
  children: ReactNode
}

export function NavItemLink({
  item,
  className,
  onClick,
  children,
}: NavItemLinkProps) {
  return (
    <AppLink
      to={item.to}
      href={item.href}
      className={className}
      onClick={onClick}
    >
      {children}
    </AppLink>
  )
}
