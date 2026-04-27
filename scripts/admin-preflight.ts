#!/usr/bin/env node
/**
 * Admin Dashboard Pre-Flight Diagnostics
 *
 * Validates environment readiness before running the admin dashboard.
 * Run with: pnpm admin:preflight
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const BOLD = '\x1b[1m';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  message: string;
}

const results: CheckResult[] = [];
let criticalFailures = 0;

function addResult(name: string, status: CheckResult['status'], message: string) {
  results.push({ name, status, message });
  if (status === 'fail') criticalFailures++;
}

function printHeader(title: string) {
  console.log(`\n${BOLD}${BLUE}${title}${RESET}`);
  console.log('─'.repeat(50));
}

function printResult({ name, status, message }: CheckResult) {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : status === 'warn' ? '⚠️' : '⏭️';
  const color = status === 'pass' ? GREEN : status === 'fail' ? RED : status === 'warn' ? YELLOW : RESET;
  console.log(`  ${icon} ${color}${name}${RESET}: ${message}`);
}

// ═══════════════════════════════════════════════════════════════
// Auth Checks
// ═══════════════════════════════════════════════════════════════
printHeader('Auth');

const isProd = process.env.NODE_ENV === 'production';
const adminPassword = process.env.ADMIN_PASSWORD?.trim();
const sessionSigningKey = process.env.SESSION_SIGNING_KEY;

if (isProd) {
  if (!adminPassword || adminPassword.length < 12) {
    addResult('ADMIN_PASSWORD', 'fail', 'Must be set in production and ≥12 characters');
  } else {
    addResult('ADMIN_PASSWORD', 'pass', 'Set and secure');
  }
} else {
  addResult('ADMIN_PASSWORD', 'warn', `Not required in development (current: ${adminPassword ? 'set' : 'unset'})`);
}

if (!sessionSigningKey) {
  addResult('SESSION_SIGNING_KEY', isProd ? 'fail' : 'warn', 'Not set');
} else {
  const keyLength = Buffer.from(sessionSigningKey).length;
  if (keyLength < 32) {
    addResult('SESSION_SIGNING_KEY', 'fail', `Length ${keyLength} bytes < 32 bytes required`);
  } else {
    addResult('SESSION_SIGNING_KEY', 'pass', `${keyLength} bytes`);
  }
}

// ═══════════════════════════════════════════════════════════════
// Database Checks
// ═══════════════════════════════════════════════════════════════
printHeader('Database');

const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!tursoUrl) {
  addResult('TURSO_DATABASE_URL', isProd ? 'fail' : 'warn', 'Not set');
} else if (!tursoUrl.startsWith('libsql://')) {
  addResult('TURSO_DATABASE_URL', 'fail', `Must start with libsql:// (got: ${tursoUrl.slice(0, 20)}...)`);
} else {
  addResult('TURSO_DATABASE_URL', 'pass', 'Valid libsql:// URL');
}

if (!tursoToken) {
  addResult('TURSO_AUTH_TOKEN', isProd ? 'fail' : 'warn', 'Not set');
} else {
  addResult('TURSO_AUTH_TOKEN', 'pass', 'Set');
}

// ═══════════════════════════════════════════════════════════════
// Analytics Checks
// ═══════════════════════════════════════════════════════════════
printHeader('Analytics');

const posthogKey = process.env.POSTHOG_PERSONAL_API_KEY?.trim();
const posthogProjectId = process.env.POSTHOG_PROJECT_ID?.trim();

if (!posthogKey) {
  addResult('POSTHOG_PERSONAL_API_KEY', isProd ? 'fail' : 'warn', 'Not set');
} else {
  addResult('POSTHOG_PERSONAL_API_KEY', 'pass', 'Set');
}

if (!posthogProjectId) {
  addResult('POSTHOG_PROJECT_ID', isProd ? 'fail' : 'warn', 'Not set');
} else if (!/^\d+$/.test(posthogProjectId)) {
  addResult('POSTHOG_PROJECT_ID', 'fail', `Must be numeric (got: ${posthogProjectId})`);
} else {
  addResult('POSTHOG_PROJECT_ID', 'pass', `ID: ${posthogProjectId}`);
}

// ═══════════════════════════════════════════════════════════════
// Infrastructure Checks
// ═══════════════════════════════════════════════════════════════
printHeader('Infrastructure');

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
if (!siteUrl) {
  addResult('NEXT_PUBLIC_SITE_URL', isProd ? 'fail' : 'warn', 'Not set');
} else {
  try {
    new URL(siteUrl);
    addResult('NEXT_PUBLIC_SITE_URL', 'pass', siteUrl);
  } catch {
    addResult('NEXT_PUBLIC_SITE_URL', 'fail', `Invalid URL: ${siteUrl}`);
  }
}

// vercel.json cron check
const vercelJsonPath = join(process.cwd(), 'vercel.json');
try {
  const vercelJson = JSON.parse(readFileSync(vercelJsonPath, 'utf-8'));
  const hasCron = vercelJson.crons?.some(
    (c: { path: string }) => c.path === '/api/admin/analytics-rollup'
  );
  if (hasCron) {
    addResult('vercel.json cron', 'pass', 'Analytics rollup cron configured');
  } else {
    addResult('vercel.json cron', 'warn', 'Missing /api/admin/analytics-rollup cron job');
  }
} catch {
  addResult('vercel.json cron', 'warn', 'vercel.json not found or invalid');
}

// File existence checks
const analyticsRollupsPath = join(process.cwd(), 'app', 'admin', 'lib', 'analytics-rollups.ts');
try {
  readFileSync(analyticsRollupsPath);
  addResult('analytics-rollups.ts', 'pass', 'Exists');
} catch {
  addResult('analytics-rollups.ts', 'fail', 'Not found');
}

// Schema health check (SKIP if missing env vars)
if (tursoUrl && tursoToken) {
  try {
    const { getAnalyticsRollupHealth } = await import(
      join(process.cwd(), 'app', 'admin', 'lib', 'analytics-rollups.ts')
    );
    const health = await getAnalyticsRollupHealth();
    const schemaHealth = health.schemaHealth ?? 'unknown';
    const status = schemaHealth === 'healthy' ? 'pass' : schemaHealth === 'outdated' ? 'warn' : 'warn';
    addResult('Schema Health', status, schemaHealth);
  } catch (err) {
    addResult('Schema Health', 'skip', `Could not check: ${(err as Error).message}`);
  }
} else {
  addResult('Schema Health', 'skip', 'Turso credentials missing');
}

// ═══════════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════════
console.log(`\n${BOLD}${'═'.repeat(50)}${RESET}`);
console.log(`${BOLD}Summary${RESET}`);
console.log('─'.repeat(50));

results.forEach(printResult);

const passCount = results.filter((r) => r.status === 'pass').length;
const warnCount = results.filter((r) => r.status === 'warn').length;
const failCount = results.filter((r) => r.status === 'fail').length;
const skipCount = results.filter((r) => r.status === 'skip').length;

console.log(`\n${BOLD}Totals:${RESET} ${GREEN}${passCount} pass${RESET}, ${YELLOW}${warnCount} warn${RESET}, ${RED}${failCount} fail${RESET}, ${skipCount} skip`);

if (criticalFailures > 0) {
  console.log(`\n${RED}${BOLD}❌ ${criticalFailures} critical check(s) failed. Fix before deploying.${RESET}\n`);
  process.exit(1);
} else if (warnCount > 0) {
  console.log(`\n${YELLOW}⚠️  ${warnCount} warning(s). Review before deploying.${RESET}\n`);
  process.exit(0);
} else {
  console.log(`\n${GREEN}${BOLD}✅ All checks passed.${RESET}\n`);
  process.exit(0);
}
