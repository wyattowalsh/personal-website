import { z } from 'zod'
import { IDEMPOTENCY_KEY_MAX_LENGTH } from './db/reliability-store'

export const createSketchSchema = z.object({
  title: z.string().max(200).default('Untitled Sketch'),
  description: z.string().max(5000).default(''),
  code: z.string().min(1).max(100_000),
  engine: z.enum(['p5js', 'glsl', 'webgpu']).default('p5js'),
  tags: z.array(z.string().max(50)).max(10).default([]),
  forkedFrom: z.string().uuid().optional(),
  config: z.object({
    width: z.number().min(1).max(4096),
    height: z.number().min(1).max(4096),
    fps: z.number().min(1).max(120),
    backgroundColor: z.string(),
    pixelDensity: z.number().min(0.5).max(4),
  }).optional(),
})

export const updateSketchSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  code: z.string().min(1).max(100_000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  isPublic: z.boolean().optional(),
  config: z.object({
    width: z.number().min(1).max(4096),
    height: z.number().min(1).max(4096),
    fps: z.number().min(1).max(120),
    backgroundColor: z.string(),
    pixelDensity: z.number().min(0.5).max(4),
  }).optional(),
})

export const listSketchesSchema = z.object({
  sort: z.enum(['recent', 'popular', 'trending']).default('recent'),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
  cursor: z.string().optional(), // Opaque cursor string (e.g. "createdAt|id", "score|id|asOf")
  author: z.string().uuid().optional(),
  tag: z.string().max(50).optional(),
  engine: z.enum(['p5js', 'glsl', 'webgpu']).optional(),
  search: z.string().max(100).optional(),
}).strict()

export const feedQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
  cursor: z.string().optional(),
}).strict()

export const sketchIdSchema = z.object({
  id: z.string().uuid(),
}).strict()

export const collectionIdSchema = z.object({
  id: z.string().uuid(),
}).strict()

export const userIdParamSchema = z.object({
  userId: z.string().uuid(),
}).strict()

export const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().max(500).optional().or(z.literal('')),
  socialLinks: z.object({
    github: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),
})

export const reportSketchSchema = z.object({
  reason: z.string().min(10).max(1000),
})

export const createCommentSchema = z.object({
  // Strip all angle-bracket characters so HTML/tag injection is impossible
  // regardless of encoding tricks. Comments are plain text only.
  body: z.string().min(1).max(5000).transform(v => v.replace(/[<>]/g, '').trim()),
  parentId: z.string().uuid().optional(),
})

export const listCommentsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

export const followActionSchema = z.object({
  action: z.enum(['follow', 'unfollow']),
}).strict()

export const listNotificationsSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
  unreadOnly: z.coerce.boolean().default(false),
  countOnly: z.coerce.boolean().default(false),
})

export const markNotificationsReadSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100).optional(),
  all: z.boolean().optional(),
})

export const createCollectionSchema = z.object({
  name: z.string().min(1).max(200).transform(v => v.replace(/<[^>]*>/g, '')),
  description: z.string().max(1000).default('').transform(v => v.replace(/<[^>]*>/g, '')),
  isPublic: z.boolean().default(true),
})

export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(200).transform(v => v.replace(/<[^>]*>/g, '')).optional(),
  description: z.string().max(1000).transform(v => v.replace(/<[^>]*>/g, '')).optional(),
  isPublic: z.boolean().optional(),
})

export const addToCollectionSchema = z.object({
  sketchId: z.string().uuid(),
}).strict()

export const deleteCommentSchema = z.object({
  commentId: z.string().uuid(),
}).strict()

export const idempotencyKeySchema = z
  .string()
  .trim()
  .min(8)
  .max(IDEMPOTENCY_KEY_MAX_LENGTH)
  .regex(/^[A-Za-z0-9:_-]+$/)
