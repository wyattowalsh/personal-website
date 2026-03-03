// Barrel file — re-exports everything from domain modules
// so existing `import { ... } from '@/lib/studio/db'` paths continue to work

export { getDb, getDbConnectionHealth } from './connection'

export { toStudioUser, toSketch, toSketchSummary, toComment, toNotification, escapeLike } from './mappers'

export { getOrCreateUser, getUserProfile, updateUserProfile, getUserStats } from './users'

export {
  getRecentSketches,
  getSketchById,
  createSketch,
  updateSketch,
  deleteSketch,
  recordSketchView,
  updateThumbnailUrl,
  getRelatedSketches,
  getUserSketches,
  getOwnedSketches,
} from './sketches'

export {
  toggleLike,
  isLiked,
  reportSketch,
  createComment,
  getComments,
  deleteComment,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowCounts,
  createNotification,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationsRead,
  deleteNotifications,
  getUserFeed,
  toggleBookmark,
  isBookmarked,
  getUserBookmarks,
} from './social'

export {
  createCollection,
  getUserCollections,
  getCollectionById,
  addToCollection,
  removeFromCollection,
  deleteCollection,
} from './collections'

export { checkRateLimit } from './rate-limit'
export {
  reserveIdempotencyKey,
  completeIdempotencyKey,
  releasePendingIdempotencyKey,
  createIdempotencyRequestHash,
  type IdempotencyReservation,
  type IdempotencyResponseBody,
} from './idempotency'
export {
  AUTH_FAILURE_THRESHOLD,
  AUTH_FAILURE_WINDOW_MINUTES,
  AUTH_FAILURE_COOLDOWN_MINUTES,
  createAuthFailureThrottleKey,
  getAuthFailureThrottleState,
  recordAuthFailure,
  clearAuthFailureThrottle,
  type AuthFailureThrottleState,
} from './auth-failure-throttle'
export {
  RATE_LIMIT_IDEMPOTENCY_STORE,
  IDEMPOTENCY_KEY_HEADER,
  IDEMPOTENCY_KEY_MAX_LENGTH,
  type RateLimitIdempotencyStore,
} from './reliability-store'
