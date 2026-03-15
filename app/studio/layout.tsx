import { StudioProviders } from '@/components/studio/StudioProviders'
import { StudioNavLink } from '@/components/studio/StudioNavLink'
import { StudioPageContainer } from '@/components/studio/StudioShell'
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
      <div id="studio-root" className="min-h-screen bg-background text-foreground">
        <a
          href="#studio-main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
        <nav
          aria-label="Studio navigation"
          className="sticky top-16 sm:top-[4.5rem] md:top-20 z-40 border-b border-border/40 bg-background/70 backdrop-blur-lg"
        >
          <StudioPageContainer className="flex items-center gap-0.5 overflow-x-auto py-2">
            {studioNav.map(({ href, label }) => (
              <StudioNavLink key={href} href={href} label={label} />
            ))}
          </StudioPageContainer>
        </nav>
        <main id="studio-main" className="min-h-[calc(100vh-10rem)] pt-6">
          {children}
        </main>
      </div>
    </StudioProviders>
  )
}
