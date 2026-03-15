'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface StudioNavLinkProps {
  href: string
  label: string
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/studio') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function StudioNavLink({ href, label }: StudioNavLinkProps) {
  const pathname = usePathname()
  const isActive = isActivePath(pathname, href)

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isActive
          ? 'bg-accent/35 text-foreground'
          : 'text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground'
      )}
    >
      {label}
    </Link>
  )
}
