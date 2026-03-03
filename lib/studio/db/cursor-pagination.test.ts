import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildCreatedAtIdCursor,
  buildLikeCountCursor,
  buildTrendingCursor,
  parseCreatedAtIdCursor,
  parseLikeCountCursor,
  parseTrendingCursor,
} from './cursor-pagination'

const FIRST_UUID = '11111111-1111-4111-8111-111111111111'
const SECOND_UUID = '22222222-2222-4222-8222-222222222222'

test('parses createdAt|id cursors and rejects invalid values', () => {
  const cursor = parseCreatedAtIdCursor('2026-01-15T10:20:30.000Z|11111111-1111-4111-8111-111111111111')
  assert.ok(cursor)
  assert.equal(cursor.id, FIRST_UUID)
  assert.equal(cursor.createdAt.toISOString(), '2026-01-15T10:20:30.000Z')

  assert.equal(parseCreatedAtIdCursor('not-a-date|11111111-1111-4111-8111-111111111111'), null)
  assert.equal(parseCreatedAtIdCursor('2026-01-15T10:20:30.000Z|not-a-uuid'), null)
})

test('parses likeCount|id cursors and rejects invalid counts', () => {
  const cursor = parseLikeCountCursor('42|11111111-1111-4111-8111-111111111111')
  assert.ok(cursor)
  assert.equal(cursor.likeCount, 42)
  assert.equal(cursor.id, FIRST_UUID)

  assert.equal(parseLikeCountCursor('NaN|11111111-1111-4111-8111-111111111111'), null)
  assert.equal(parseLikeCountCursor('42.5|11111111-1111-4111-8111-111111111111'), null)
  assert.equal(parseLikeCountCursor('42abc|11111111-1111-4111-8111-111111111111'), null)
  assert.equal(parseLikeCountCursor('42|bad-id'), null)
})

test('accepts both legacy and stable trending cursors', () => {
  const fallbackAsOf = new Date('2026-01-20T00:00:00.000Z')

  const legacy = parseTrendingCursor(`12.5|${FIRST_UUID}`, fallbackAsOf)
  assert.ok(legacy)
  assert.equal(legacy.score, '12.5')
  assert.equal(legacy.id, FIRST_UUID)
  assert.equal(legacy.asOf.toISOString(), fallbackAsOf.toISOString())

  const stable = parseTrendingCursor(`12.5|${FIRST_UUID}|2026-01-18T12:00:00.000Z`, fallbackAsOf)
  assert.ok(stable)
  assert.equal(stable.score, '12.5')
  assert.equal(stable.id, FIRST_UUID)
  assert.equal(stable.asOf.toISOString(), '2026-01-18T12:00:00.000Z')

  assert.equal(parseTrendingCursor(`12.5abc|${FIRST_UUID}`, fallbackAsOf), null)
})

test('builds cursor strings with stable encoding', () => {
  const createdAt = new Date('2026-01-17T09:30:00.000Z')
  const asOf = new Date('2026-01-18T12:00:00.000Z')

  assert.equal(buildCreatedAtIdCursor(createdAt, FIRST_UUID), `2026-01-17T09:30:00.000Z|${FIRST_UUID}`)
  assert.equal(buildLikeCountCursor(7, FIRST_UUID), `7|${FIRST_UUID}`)
  assert.equal(buildTrendingCursor(4.25, SECOND_UUID, asOf), `4.25|${SECOND_UUID}|2026-01-18T12:00:00.000Z`)
})
