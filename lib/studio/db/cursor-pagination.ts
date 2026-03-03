const UUID_V4ISH_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value: string): boolean {
  return UUID_V4ISH_REGEX.test(value)
}

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime())
}

export type CreatedAtIdCursor = {
  createdAt: Date
  id: string
}

export type LikeCountCursor = {
  likeCount: number
  id: string
}

export type TrendingCursor = {
  score: string
  id: string
  asOf: Date
}

export function buildCreatedAtIdCursor(createdAt: Date, id: string): string {
  return `${createdAt.toISOString()}|${id}`
}

export function buildLikeCountCursor(likeCount: number, id: string): string {
  return `${likeCount}|${id}`
}

export function buildTrendingCursor(score: number | string, id: string, asOf: Date): string {
  return `${score}|${id}|${asOf.toISOString()}`
}

export function parseCreatedAtIdCursor(cursor: string): CreatedAtIdCursor | null {
  const [rawCreatedAt, id, ...rest] = cursor.split('|')
  if (rest.length > 0 || !rawCreatedAt || !id || !isUuid(id)) return null

  const createdAt = new Date(rawCreatedAt)
  if (!isValidDate(createdAt)) return null

  return { createdAt, id }
}

export function parseLikeCountCursor(cursor: string): LikeCountCursor | null {
  const [rawLikeCount, id, ...rest] = cursor.split('|')
  if (rest.length > 0 || !rawLikeCount || !id || !isUuid(id)) return null

  const likeCount = Number(rawLikeCount)
  if (!Number.isInteger(likeCount)) return null

  return { likeCount, id }
}

export function parseTrendingCursor(cursor: string, fallbackAsOf: Date): TrendingCursor | null {
  const [rawScore, id, rawAsOf, ...rest] = cursor.split('|')
  if (rest.length > 0 || !rawScore || !id || !isUuid(id)) return null

  const score = Number(rawScore)
  if (!Number.isFinite(score)) return null

  const asOf = rawAsOf ? new Date(rawAsOf) : fallbackAsOf
  if (!isValidDate(asOf)) return null

  return { score: rawScore, id, asOf }
}
