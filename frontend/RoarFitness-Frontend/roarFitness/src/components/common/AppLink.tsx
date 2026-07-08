import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AppLinkProps = {
  to?: string
  href?: string
  className?: string
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'children'>

/** Internal or hash link — routes via React Router when `to` is set */
export function AppLink({
  to,
  href,
  className,
  children,
  onClick,
  ...anchorProps
}: AppLinkProps) {
  if (to) {
    return (
      <Link to={to} className={className} onClick={onClick}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href ?? '#'} className={className} onClick={onClick} {...anchorProps}>
      {children}
    </a>
  )
}
