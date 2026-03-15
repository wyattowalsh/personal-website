import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Calendar, ExternalLink, Github, Settings, Twitter, Eye, Heart, Image as ImageIcon } from 'lucide-react'
import { getUserProfile, getUserSketches, getUserStats, isFollowing, getFollowCounts } from '@/lib/studio/db'
import { auth } from '@/lib/studio/auth'
import { UserAvatar } from '@/components/studio/UserAvatar'
import { SketchGallery } from '@/components/studio/SketchGallery'
import { FollowButton } from '@/components/studio/FollowButton'
import { StudioPageContainer } from '@/components/studio/StudioShell'
import { Button } from '@/components/ui/button'
import { createStudioMetadata, studioNoIndexRobots } from '@/lib/studio/metadata'

interface PageProps {
  params: Promise<{ userId: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { userId } = await params
  const user = await getUserProfile(userId)

  if (!user) {
    return createStudioMetadata({
      title: 'User Not Found',
      description: 'The requested Studio profile could not be found',
      path: `/studio/profile/${userId}`,
      robots: studioNoIndexRobots,
    })
  }

  const displayName = user.displayName ?? user.name ?? 'Anonymous'
  return createStudioMetadata({
    title: displayName,
    description: user.bio ?? `Generative art by ${displayName}`,
    path: `/studio/profile/${userId}`,
    image: user.image ?? undefined,
  })
}

async function UserSketches({ userId, viewerId }: { userId: string; viewerId?: string }) {
  const sketches = await getUserSketches(userId, 24, 0, viewerId)
  return <SketchGallery initialSketches={sketches} initialTotal={sketches.length} />
}

async function StatsCards({ userId }: { userId: string }) {
  const stats = await getUserStats(userId)
  const items = [
    { label: 'Sketches', value: stats.totalSketches, icon: ImageIcon },
    { label: 'Likes', value: stats.totalLikes, icon: Heart },
    { label: 'Views', value: stats.totalViews, icon: Eye },
  ]

  return (
    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border/60 bg-card/50 p-4 text-center backdrop-blur-sm"
        >
          <item.icon className="mx-auto mb-2 h-4 w-4 text-muted-foreground" />
          <p className="text-2xl font-bold tabular-nums">{item.value}</p>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  )
}

export default async function UserProfilePage({ params }: PageProps) {
  const { userId } = await params
  const [user, session] = await Promise.all([getUserProfile(userId), auth()])

  if (!user) {
    notFound()
  }

  const [followCounts, isUserFollowing] = await Promise.all([
    getFollowCounts(userId),
    session?.user?.id ? isFollowing(session.user.id, userId) : Promise.resolve(false),
  ])

  const isOwnProfile = session?.user?.id === user.id
  const displayName = user.displayName ?? user.name ?? 'Anonymous'

  return (
    <StudioPageContainer className="max-w-5xl py-6">
      {/* Profile header */}
      <div className="mb-6 rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <UserAvatar name={user.name} image={user.image} size="lg" />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {displayName}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Joined{' '}
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>
                  <strong className="text-foreground">
                    {followCounts.followers}
                  </strong>{' '}
                  followers
                </span>
                <span>
                  <strong className="text-foreground">
                    {followCounts.following}
                  </strong>{' '}
                  following
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isOwnProfile && (
              <FollowButton
                userId={user.id}
                initialFollowing={isUserFollowing}
                currentUserId={session?.user?.id}
              />
            )}
            {isOwnProfile && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-border/70 bg-background/60"
              >
                <Link href="/studio/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {user.bio}
        </p>
      )}

      {/* Social links */}
      {(user.website || user.socialLinks?.github || user.socialLinks?.twitter) && (
        <div className="mb-6 flex flex-wrap items-center gap-2.5">
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {new URL(user.website).hostname}
            </a>
          )}
          {user.socialLinks?.github && (
            <a
              href={user.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
          )}
          {user.socialLinks?.twitter && (
            <a
              href={user.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Twitter className="h-3.5 w-3.5" />
              Twitter
            </a>
          )}
        </div>
      )}

      {/* Stats cards */}
      <Suspense
        fallback={
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl border border-border/60 bg-muted/50"
              />
            ))}
          </div>
        }
      >
        <StatsCards userId={userId} />
      </Suspense>

      {/* Sketches grid */}
      <div className="mb-4 border-t border-border/60 pt-6">
        <h2 className="text-lg font-semibold tracking-tight">Sketches</h2>
      </div>
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square animate-pulse rounded-lg bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        }
      >
        <UserSketches userId={userId} viewerId={session?.user?.id} />
      </Suspense>
    </StudioPageContainer>
  )
}
