import assert from 'node:assert/strict'
import test from 'node:test'

import { assertRequiredEnvVars } from './env'

test('assertRequiredEnvVars throws when a required variable is missing', () => {
  assert.throws(
    () => assertRequiredEnvVars(['POSTGRES_URL', 'AUTH_SECRET'], { POSTGRES_URL: 'postgres://db' }),
    /Missing required environment variables: AUTH_SECRET/
  )
})

test('assertRequiredEnvVars treats empty values as missing', () => {
  assert.throws(
    () => assertRequiredEnvVars(['POSTGRES_URL'], { POSTGRES_URL: '   ' }),
    /Missing required environment variables: POSTGRES_URL/
  )
})

test('assertRequiredEnvVars does not throw when all required variables are present', () => {
  assert.doesNotThrow(() =>
    assertRequiredEnvVars(['POSTGRES_URL', 'AUTH_SECRET'], {
      POSTGRES_URL: 'postgres://db',
      AUTH_SECRET: 'secret',
    })
  )
})
