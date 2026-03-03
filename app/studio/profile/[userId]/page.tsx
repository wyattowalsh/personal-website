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
    <div className="mb-8 grid grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-border bg-card p-4 text-center"
        >
          <item.icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
          <p className="text-2xl font-bold tabular-nums">{item.value}</p>
          <p className="text-xs text-muted-foreground">{item.label}</p>
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
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Profile header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar name={user.name} image={user.image} size="lg" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {displayName}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Joined{' '}
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
              })}
            </p>
            <p className="flex items-center gap-3 text-sm text-muted-foreground">
              <span><strong className="text-foreground">{followCounts.followers}</strong> followers</span>
              <span><strong className="text-foreground">{followCounts.following}</strong> following</span>
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
            <Button asChild variant="outline" size="sm">
              <Link href="/studio/settings">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
          {user.bio}
        </p>
      )}

      {/* Social links */}
      {(user.website || user.socialLinks?.github || user.socialLinks?.twitter) && (
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
          <div className="mb-8 grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        }
      >
        <StatsCards userId={userId} />
      </Suspense>

      {/* Sketches grid */}
      <h2 className="mb-4 text-lg font-semibold">Sketches</h2>
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
    </div>
  )
}
