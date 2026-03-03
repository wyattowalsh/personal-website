import Link from 'next/link'
import { StudioProviders } from '@/components/studio/StudioProviders'
import { createStudioMetadata } from '@/lib/studio/metadata'

export const metadata = createStudioMetadata({ path: '/studio' })

const studioNav = [
  { href: '/studio', label: 'Gallery' },
  { href: '/studio/feed', label: 'Feed' },
  { href: '/studio/my-sketches', label: 'My Sketches' },
  { href: '/studio/bookmarks', label: 'Bookmarks' },
  { href: '/studio/collections', label: 'Collections' },
] as const

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StudioProviders>
      <a
        href="#studio-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <nav
        aria-label="Studio navigation"
        className="sticky top-16 sm:top-[4.5rem] md:top-20 z-40 border-b border-border/40 bg-background/60 backdrop-blur-lg"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-0.5 overflow-x-auto px-4 py-2 sm:px-6">
          {studioNav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent/80 hover:text-accent-foreground"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
      <div id="studio-main" className="min-h-[calc(100vh-10rem)] pt-6">{children}</div>
    </StudioProviders>
  )
}
