import { studioUsers, sketches } from '../schema'
import type { Sketch, SketchSummary, StudioUser, Comment, Notification } from '../types'

// --- Mappers ---

export function toStudioUser(u: typeof studioUsers.$inferSelect): StudioUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    provider: u.provider,
    providerId: u.providerId,
    displayName: u.displayName,
    bio: u.bio,
    website: u.website,
    socialLinks: u.socialLinks as StudioUser['socialLinks'],
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }
}

export function toSketch(r: typeof sketches.$inferSelect): Sketch {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    code: r.code,
    engine: r.engine as Sketch['engine'],
    tags: (r.tags ?? []) as string[],
    thumbnailUrl: r.thumbnailUrl,
    authorId: r.authorId,
    forkedFrom: r.forkedFrom,
    likeCount: r.likeCount,
    viewCount: r.viewCount,
    isPublic: r.isPublic,
    config: r.config as Sketch['config'],
    slug: r.slug,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
}

export function toSketchSummary(r: {
  id: string
  title: string
  engine: string
  tags: string[] | null
  thumbnailUrl: string | null
  authorId: string
  authorName: string | null
  authorImage: string | null
  likeCount: number
  viewCount: number
  createdAt: Date
}): SketchSummary {
  return {
    id: r.id,
    title: r.title,
    engine: r.engine as SketchSummary['engine'],
    tags: (r.tags ?? []) as string[],
    thumbnailUrl: r.thumbnailUrl,
    authorId: r.authorId,
    authorName: r.authorName ?? 'Anonymous',
    authorImage: r.authorImage,
    likeCount: r.likeCount,
    viewCount: r.viewCount,
    createdAt: r.createdAt.toISOString(),
  }
}

export function toComment(r: {
  id: string
  sketchId: string
  authorId: string
  authorName: string | null
  authorImage: string | null
  parentId: string | null
  body: string
  createdAt: Date
  updatedAt: Date
}): Comment {
  return {
    id: r.id,
    sketchId: r.sketchId,
    authorId: r.authorId,
    authorName: r.authorName ?? 'Anonymous',
    authorImage: r.authorImage,
    parentId: r.parentId,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
}

export function toNotification(r: {
  id: string
  userId: string
  type: string
  actorId: string
  actorName: string | null
  actorImage: string | null
  sketchId: string | null
  sketchTitle: string | null
  commentId: string | null
  read: boolean
  createdAt: Date
}): Notification {
  return {
    id: r.id,
    userId: r.userId,
    type: r.type as Notification['type'],
    actorId: r.actorId,
    actorName: r.actorName ?? 'Anonymous',
    actorImage: r.actorImage,
    sketchId: r.sketchId,
    sketchTitle: r.sketchTitle,
    commentId: r.commentId,
    read: r.read,
    createdAt: r.createdAt.toISOString(),
  }
}

export function escapeLike(value: string): string {
  return value.replace(/%/g, '\\%').replace(/_/g, '\\_')
}
