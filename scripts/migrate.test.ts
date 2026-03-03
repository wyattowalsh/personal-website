import assert from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { runMigrationPreflight } from './migrate'

async function createMigrationDir(files: Record<string, string>) {
  const dir = await mkdtemp(path.join(tmpdir(), 'migration-preflight-'))
  await Promise.all(
    Object.entries(files).map(([fileName, sql]) =>
      writeFile(path.join(dir, fileName), sql, 'utf8'),
    ),
  )
  return dir
}

test('blocks destructive migrations by default', async () => {
  const migrationsFolder = await createMigrationDir({
    '0001_drop.sql': 'DROP TABLE studio_users;',
  })

  assert.throws(
    () => runMigrationPreflight({ migrationsFolder }),
    /Destructive migration statements detected/,
  )
})

test('allows destructive migrations only with explicit override', async () => {
  const migrationsFolder = await createMigrationDir({
    '0001_drop.sql': 'DROP TABLE studio_users;',
  })

  assert.doesNotThrow(() =>
    runMigrationPreflight({ migrationsFolder, allowDestructiveMigrations: true }),
  )
})

test('fails if migration folder does not exist', () => {
  assert.throws(
    () => runMigrationPreflight({ migrationsFolder: '/tmp/does-not-exist-folder' }),
    /Migration folder not found/,
  )
})

test('returns preflight summary for safe migrations', async () => {
  const migrationsFolder = await createMigrationDir({
    '0001_safe.sql': 'CREATE TABLE test_table (id uuid PRIMARY KEY);',
  })

  const summary = runMigrationPreflight({ migrationsFolder })
  assert.equal(summary.migrationFileCount, 1)
  assert.equal(summary.destructiveFindings.length, 0)
})
