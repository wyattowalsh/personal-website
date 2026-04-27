import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.AXE_BASE_URL || 'http://localhost:3458';
const ROUTES = ['/admin', '/admin/content', '/admin/blog-stats'];
const OUTPUT_DIR = join(process.cwd(), 'audits');
const OUTPUT_FILE = join(OUTPUT_DIR, 'accessibility-admin.json');

function runAxe(url: string) {
  try {
    const result = execSync(`npx axe "${url}" --stdout --format json`, {
      encoding: 'utf-8',
      timeout: 60000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return JSON.parse(result);
  } catch (error) {
    // axe exits with code 1 when violations are found, but still outputs JSON
    if (error instanceof Error && 'stdout' in error) {
      try {
        return JSON.parse(String((error as { stdout: string }).stdout));
      } catch {
        return {
          url,
          error: String(
            (error as { stdout: string }).stdout || error.message
          ),
        };
      }
    }
    return {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function main() {
  console.log('Running axe-core accessibility audit on admin routes...\n');

  const results = ROUTES.map((route) => {
    const url = `${BASE_URL}${route}`;
    console.log(`Auditing ${url}...`);
    const result = runAxe(url);
    console.log(`Completed ${url}`);
    return { route, url, result };
  });

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(
      { auditedAt: new Date().toISOString(), baseUrl: BASE_URL, results },
      null,
      2
    )
  );

  console.log(`\nAudit complete. Report written to ${OUTPUT_FILE}`);
}

main();
