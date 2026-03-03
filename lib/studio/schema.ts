import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, primaryKey, index, uniqueIndex } from 'drizzle-orm/pg-core'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'

type IdempotencyResponseBody = unknown

export const studioUsers = pgTable('studio_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Migration note: if adding NOT NULL to an existing DB, run first:
  // UPDATE studio_users SET name = '' WHERE name IS NULL;
  name: varchar('name', { length: 100 }).notNull().default(''),
  email: varchar('email', { length: 255 }),
  image: text('image'),
  provider: varchar('provider', { length: 20 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  website: varchar('website', { length: 500 }),
  socialLinks: jsonb('social_links').$type<{ github?: string; twitter?: string; website?: string }>(),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('idx_studio_users_provider').on(table.provider, table.providerId),
])

export const authFailureThrottle = pgTable('auth_failure_throttle', {
  throttleKey: varchar('throttle_key', { length: 320 }).primaryKey(),
  failureCount: integer('failure_count').notNull().default(0),
  firstFailureAt: timestamp('first_failure_at', { withTimezone: true }).notNull().defaultNow(),
  lastFailureAt: timestamp('last_failure_at', { withTimezone: true }).notNull().defaultNow(),
  cooldownUntil: timestamp('cooldown_until', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_auth_failure_throttle_cooldown').on(table.cooldownUntil),
  index('idx_auth_failure_throttle_updated').on(table.updatedAt),
])

export const sketches = pgTable('sketches', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull().default('Untitled Sketch'),
  description: text('description').default(''),
  code: text('code').notNull(),
  engine: varchar('engine', { length: 10 }).notNull().default('p5js'),
  tags: text('tags').array().default([]),
  thumbnailUrl: text('thumbnail_url'),
  authorId: uuid('author_id').notNull().references(() => studioUsers.id, { onDelete: 'cascade' }),
  forkedFrom: uuid('forked_from').references((): AnyPgColumn => sketches.id, { onDelete: 'set null' }),
  likeCount: integer('like_count').notNull().default(0),
  viewCount: integer('view_count').notNull().default(0),
  isPublic: boolean('is_public').notNull().default(true),
  config: jsonb('config').$type<import('./types').SketchConfig>(),
  slug: varchar('slug', { length: 250 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_sketches_public').on(table.isPublic, table.createdAt),
  index('idx_sketches_created_id').on(table.createdAt, table.id),
  index('idx_sketches_likes').on(table.isPublic, table.likeCount),
  index('idx_sketches_author').on(table.authorId),
  index('idx_sketches_tags').using('gin', table.tags),
  uniqueIndex('idx_sketches_slug').on(table.slug),
])

export const sketchLikes = pgTable('sketch_likes', {
  sketchId: uuid('sketch_id').notNull().references(() => sketches.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => studioUsers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.sketchId, table.userId] }),
  index('idx_sketch_likes_user').on(table.userId),
])

export const sketchReports = pgTable('sketch_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  sketchId: uuid('sketch_id').notNull().references(() => sketches.id, { onDelete: 'cascade' }),
  reporterId: uuid('reporter_id').notNull().references(() => studioUsers.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_sketch_reports_sketch').on(table.sketchId),
  uniqueIndex('idx_sketch_reports_unique').on(table.sketchId, table.reporterId),
])

export const sketchComments = pgTable('sketch_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  sketchId: uuid('sketch_id').notNull().references(() => sketches.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => studioUsers.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id').references((): AnyPgColumn => sketchComments.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_sketch_comments_sketch').on(table.sketchId, table.createdAt),
  index('idx_sketch_comments_author').on(table.authorId),
])

export const studioFollows = pgTable('studio_follows', {
  followerId: uuid('follower_id').notNull().references(() => studioUsers.id, { onDelete: 'cascade' }),
  followingId: uuid('following_id').notNull().references(() => studioUsers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.followerId, table.followingId] }),
  index('idx_studio_follows_follower').on(table.followerId),
  index('idx_studio_follows_following').on(table.followingId),
])

export const studioNotifications = pgTable('studio_notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => studioUsers.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 30 }).notNull(), // 'like' | 'fork' | 'follow' | 'comment' | 'mention'
  actorId: uuid('actor_id').notNull().references(() => studioUsers.id, { onDelete: 'cascade' }),
  sketchId: uuid('sketch_id').references(() => sketches.id, { onDelete: 'cascade' }),
  commentId: uuid('comment_id').references(() => sketchComments.id, { onDelete: 'cascade' }),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_studio_notifications_user').on(table.userId, table.read, table.createdAt),
])

export const sketchViews = pgTable('sketch_views', {
  id: uuid('id').defaultRandom().primaryKey(),
  sketchId: uuid('sketch_id').notNull().references(() => sketches.id, { onDelete: 'cascade' }),
  viewerHash: varchar('viewer_hash', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('idx_sketch_views_unique').on(table.sketchId, table.viewerHash),
])

export const sketchVersions = pgTable('sketch_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sketchId: uuid('sketch_id').notNull().references(() => sketches.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  config: jsonb('config'),
  version: integer('version').notNull(),
  message: varchar('message', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_sketch_versions_sketch').on(table.sketchId, table.version),
])

export const sketchBookmarks = pgTable('sketch_bookmarks', {
  sketchId: uuid('sketch_id').notNull().references(() => sketches.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => studioUsers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.sketchId, table.userId] }),
  index('idx_sketch_bookmarks_user').on(table.userId, table.createdAt),
])

export const studioCollections = pgTable('studio_collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id').notNull().references(() => studioUsers.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description').default(''),
  isPublic: boolean('is_public').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_studio_collections_owner').on(table.ownerId),
])

export const studioCollectionItems = pgTable('studio_collection_items', {
  collectionId: uuid('collection_id').notNull().references(() => studioCollections.id, { onDelete: 'cascade' }),
  sketchId: uuid('sketch_id').notNull().references(() => sketches.id, { onDelete: 'cascade' }),
  addedAt: timestamp('added_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.collectionId, table.sketchId] }),
  index('idx_studio_collection_items_collection').on(table.collectionId),
])

export const studioRateLimitCounters = pgTable('studio_rate_limit_counters', {
  userId: uuid('user_id').notNull().references(() => studioUsers.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 50 }).notNull(),
  windowHours: integer('window_hours').notNull(),
  windowStartedAt: timestamp('window_started_at', { withTimezone: true }).notNull().defaultNow(),
  count: integer('count').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.action, table.windowHours] }),
  index('idx_studio_rate_limit_counters_updated').on(table.updatedAt),
])

export const studioIdempotencyKeys = pgTable('studio_idempotency_keys', {
  userId: uuid('user_id').notNull().references(() => studioUsers.id, { onDelete: 'cascade' }),
  scope: varchar('scope', { length: 120 }).notNull(),
  key: varchar('key', { length: 128 }).notNull(),
  requestHash: varchar('request_hash', { length: 64 }).notNull(),
  state: varchar('state', { length: 20 }).notNull().default('pending'),
  responseStatus: integer('response_status'),
  responseBody: jsonb('response_body').$type<IdempotencyResponseBody>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => [
  primaryKey({ columns: [table.userId, table.scope, table.key] }),
  index('idx_studio_idempotency_keys_updated').on(table.updatedAt),
])
