import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { migrate } from 'drizzle-orm/neon-http/migrator'
import fs from 'node:fs'
import path from 'path'

type DestructiveFinding = {
  fileName: string
  statement: string
}

type MigrationPreflightSummary = {
  migrationFileCount: number
  destructiveFindings: DestructiveFinding[]
}

const DESTRUCTIVE_SQL_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  { label: 'DROP TABLE', regex: /\bdrop\s+table\b/i },
  { label: 'DROP COLUMN', regex: /\bdrop\s+column\b/i },
  { label: 'DROP SCHEMA', regex: /\bdrop\s+schema\b/i },
  { label: 'DROP DATABASE', regex: /\bdrop\s+database\b/i },
  { label: 'TRUNCATE', regex: /\btruncate\b/i },
]

function envFlagEnabled(name: string): boolean {
  const value = process.env[name]?.trim().toLowerCase()
  return value === '1' || value === 'true' || value === 'yes' || value === 'on'
}

function stripSqlComments(sql: string): string {
  return sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*$/gm, '')
}

export function runMigrationPreflight({
  migrationsFolder,
  allowDestructiveMigrations = false,
}: {
  migrationsFolder: string
  allowDestructiveMigrations?: boolean
}): MigrationPreflightSummary {
  if (!fs.existsSync(migrationsFolder) || !fs.statSync(migrationsFolder).isDirectory()) {
    throw new Error(`Migration folder not found: ${migrationsFolder}`)
  }

  const migrationFiles = fs
    .readdirSync(migrationsFolder)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort()

  if (migrationFiles.length === 0) {
    throw new Error(`No migration files found in ${migrationsFolder}`)
  }

  const destructiveFindings: DestructiveFinding[] = []

  for (const fileName of migrationFiles) {
    const filePath = path.join(migrationsFolder, fileName)
    const sql = stripSqlComments(fs.readFileSync(filePath, 'utf8'))

    for (const pattern of DESTRUCTIVE_SQL_PATTERNS) {
      if (pattern.regex.test(sql)) {
        destructiveFindings.push({ fileName, statement: pattern.label })
      }
    }
  }

  if (destructiveFindings.length > 0 && !allowDestructiveMigrations) {
    const findingsSummary = destructiveFindings
      .map((finding) => `- ${finding.fileName}: ${finding.statement}`)
      .join('\n')

    throw new Error(
      `Destructive migration statements detected. Refusing to continue.\n${findingsSummary}\nSet ALLOW_DESTRUCTIVE_DB_MIGRATIONS=true only if this deploy is explicitly approved.`,
    )
  }

  return {
    migrationFileCount: migrationFiles.length,
    destructiveFindings,
  }
}

async function main() {
  const migrationsFolder = path.join(process.cwd(), 'drizzle')
  const checkOnly = envFlagEnabled('DB_MIGRATION_CHECK_ONLY')
  const migrateOnDeploy = envFlagEnabled('DB_MIGRATE_ON_DEPLOY')
  const allowDestructiveMigrations = envFlagEnabled('ALLOW_DESTRUCTIVE_DB_MIGRATIONS')

  console.log('Running database migration preflight checks...')
  const preflight = runMigrationPreflight({ migrationsFolder, allowDestructiveMigrations })
  console.log(`Preflight checks passed for ${preflight.migrationFileCount} migration file(s).`)

  if (checkOnly) {
    console.log('DB_MIGRATION_CHECK_ONLY=true, skipping migration execution.')
    return
  }

  if (!migrateOnDeploy) {
    throw new Error(
      'Refusing to run migrations during deploy without DB_MIGRATE_ON_DEPLOY=true. Set DB_MIGRATION_CHECK_ONLY=true to run preflight checks only.',
    )
  }

  const url = process.env.POSTGRES_URL
  if (!url) {
    throw new Error('POSTGRES_URL environment variable is required when DB_MIGRATE_ON_DEPLOY=true')
  }

  const sql = neon(url)
  const db = drizzle(sql)

  console.log('Running database migrations...')
  await migrate(db, { migrationsFolder })
  console.log('Migrations complete.')
}

const isMainModule =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('scripts/migrate.ts') ||
  process.argv[1]?.endsWith('scripts/migrate.js')

if (isMainModule) {
  main().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`Migration failed: ${message}`)
    process.exit(1)
  })
}
