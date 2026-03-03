#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

type DrillMode = 'dry-run' | 'live'
type DrillScenario = 'pass' | 'rollback'
type CheckpointStatus = 'passed' | 'failed'
type Decision = 'promote' | 'rollback'

type MetricSnapshot = {
  errorRatePct: number
  p95LatencyMs: number
  successRatePct: number
  windowMinutes: number
}

type RollbackTrigger = {
  name: string
  threshold: string
  actual: number
  breached: boolean
}

type DrillReport = {
  drillId: string
  mode: DrillMode
  scenario: DrillScenario
  startedAt: string
  endedAt: string
  checkpoints: Array<{
    name: string
    status: CheckpointStatus
    detail: string
  }>
  metrics: MetricSnapshot
  triggers: RollbackTrigger[]
  rollbackRequired: boolean
  rollbackReasons: string[]
  decision: Decision
  commands: {
    canary: string[]
    promote: string[]
    rollback: string[]
  }
  artifactPath: string
}

const MAX_ERROR_RATE_PCT = 1
const MAX_P95_LATENCY_MS = 1200
const MIN_SUCCESS_RATE_PCT = 99.5

const DEFAULT_METRICS: Record<DrillScenario, MetricSnapshot> = {
  pass: {
    errorRatePct: 0.2,
    p95LatencyMs: 480,
    successRatePct: 99.97,
    windowMinutes: 15,
  },
  rollback: {
    errorRatePct: 2.8,
    p95LatencyMs: 1840,
    successRatePct: 98.9,
    windowMinutes: 15,
  },
}

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const trimmed = arg.slice(2)
    const [key, inlineValue] = trimmed.split('=')
    if (!key) continue
    if (inlineValue !== undefined) {
      args[key] = inlineValue
      continue
    }
    const next = argv[i + 1]
    if (next && !next.startsWith('--')) {
      args[key] = next
      i++
      continue
    }
    args[key] = 'true'
  }
  return args
}

function parseNumberArg(value: string | undefined, fallback: number, name: string): number {
  if (!value) return fallback
  const parsed = Number(value)
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric value for --${name}: ${value}`)
  }
  return parsed
}

function buildCommandSet(releaseId: string) {
  const siteDomain = '${SITE_DOMAIN}'
  const canaryDeployment = '${CANARY_DEPLOYMENT_URL}'
  const lastGoodDeployment = '${LAST_GOOD_DEPLOYMENT_URL}'

  return {
    canary: [
      'pnpm lint',
      'pnpm typecheck',
      'pnpm build',
      `vercel deploy --prebuilt --yes --target=preview --meta release=${releaseId}`,
      `vercel alias set ${canaryDeployment} canary.${siteDomain}`,
      '# shift 10% traffic to canary using your edge router/flag provider',
      `curl -fsS https://canary.${siteDomain}/api/health`,
    ],
    promote: [
      `vercel promote ${canaryDeployment} --yes`,
      `vercel alias set ${canaryDeployment} ${siteDomain}`,
      `curl -fsS https://${siteDomain}/api/health`,
    ],
    rollback: [
      `vercel rollback ${lastGoodDeployment} --yes`,
      `vercel alias set ${lastGoodDeployment} ${siteDomain}`,
      `vercel alias rm canary.${siteDomain}`,
      `curl -fsS https://${siteDomain}/api/health`,
    ],
  }
}

function evaluateTriggers(metrics: MetricSnapshot): RollbackTrigger[] {
  return [
    {
      name: 'error_rate_pct',
      threshold: `<= ${MAX_ERROR_RATE_PCT}`,
      actual: metrics.errorRatePct,
      breached: metrics.errorRatePct > MAX_ERROR_RATE_PCT,
    },
    {
      name: 'p95_latency_ms',
      threshold: `<= ${MAX_P95_LATENCY_MS}`,
      actual: metrics.p95LatencyMs,
      breached: metrics.p95LatencyMs > MAX_P95_LATENCY_MS,
    },
    {
      name: 'success_rate_pct',
      threshold: `>= ${MIN_SUCCESS_RATE_PCT}`,
      actual: metrics.successRatePct,
      breached: metrics.successRatePct < MIN_SUCCESS_RATE_PCT,
    },
  ]
}

function formatTriggerReason(trigger: RollbackTrigger): string {
  const comparator = trigger.name === 'success_rate_pct' ? '<' : '>'
  return `${trigger.name}: ${trigger.actual} ${comparator} threshold ${trigger.threshold}`
}

function printCommands(label: string, commands: string[]) {
  console.log(`\n${label}`)
  commands.forEach((command, index) => {
    console.log(`  ${index + 1}. ${command}`)
  })
}

async function run() {
  const startedAt = new Date().toISOString()
  const args = parseArgs(process.argv.slice(2))
  const mode: DrillMode = args.mode === 'live' ? 'live' : 'dry-run'
  const scenario: DrillScenario = args.scenario === 'pass' ? 'pass' : 'rollback'
  const baseMetrics = DEFAULT_METRICS[scenario]

  const metrics: MetricSnapshot = {
    errorRatePct: parseNumberArg(args['error-rate'], baseMetrics.errorRatePct, 'error-rate'),
    p95LatencyMs: parseNumberArg(args.p95, baseMetrics.p95LatencyMs, 'p95'),
    successRatePct: parseNumberArg(args['success-rate'], baseMetrics.successRatePct, 'success-rate'),
    windowMinutes: parseNumberArg(args['window-minutes'], baseMetrics.windowMinutes, 'window-minutes'),
  }

  const drillId = new Date().toISOString().replace(/[:.]/g, '-')
  const releaseId = args.release ?? `drill-${drillId}`
  const commands = buildCommandSet(releaseId)
  const triggers = evaluateTriggers(metrics)
  const rollbackReasons = triggers.filter((trigger) => trigger.breached).map(formatTriggerReason)
  const rollbackRequired = rollbackReasons.length > 0
  const decision: Decision = rollbackRequired ? 'rollback' : 'promote'

  const checkpoints: DrillReport['checkpoints'] = [
    {
      name: 'quality-gates',
      status: 'passed',
      detail: 'lint + typecheck + build prerequisites acknowledged',
    },
    {
      name: 'canary-release',
      status: 'passed',
      detail: 'preview deployment + canary alias + traffic shift step defined',
    },
    {
      name: 'canary-monitoring-window',
      status: rollbackRequired ? 'failed' : 'passed',
      detail: rollbackRequired
        ? rollbackReasons.join('; ')
        : `${metrics.windowMinutes} minute canary metrics stayed within thresholds`,
    },
    {
      name: 'decision',
      status: rollbackRequired ? 'failed' : 'passed',
      detail: rollbackRequired ? 'rollback command path selected' : 'promotion command path selected',
    },
  ]

  const artifactDir = path.join(process.cwd(), '.cache', 'drills')
  await mkdir(artifactDir, { recursive: true })
  const artifactPath = path.join(artifactDir, `canary-rollback-${drillId}.json`)

  const report: DrillReport = {
    drillId,
    mode,
    scenario,
    startedAt,
    endedAt: new Date().toISOString(),
    checkpoints,
    metrics,
    triggers,
    rollbackRequired,
    rollbackReasons,
    decision,
    commands,
    artifactPath,
  }

  await writeFile(artifactPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log(`Canary drill id: ${drillId}`)
  console.log(`Mode: ${mode}`)
  console.log(`Scenario: ${scenario}`)
  console.log(`Monitoring window: ${metrics.windowMinutes} minutes`)
  console.log(`Decision: ${decision.toUpperCase()}`)
  console.log(`Evidence artifact: ${artifactPath}`)
  console.log('\nRollback trigger thresholds:')
  console.log(`  - error_rate_pct <= ${MAX_ERROR_RATE_PCT}`)
  console.log(`  - p95_latency_ms <= ${MAX_P95_LATENCY_MS}`)
  console.log(`  - success_rate_pct >= ${MIN_SUCCESS_RATE_PCT}`)
  console.log('\nObserved canary metrics:')
  console.log(`  - error_rate_pct: ${metrics.errorRatePct}`)
  console.log(`  - p95_latency_ms: ${metrics.p95LatencyMs}`)
  console.log(`  - success_rate_pct: ${metrics.successRatePct}`)
  console.log('\nCheckpoint results:')
  checkpoints.forEach((checkpoint) => {
    const symbol = checkpoint.status === 'passed' ? '✅' : '❌'
    console.log(`  ${symbol} ${checkpoint.name}: ${checkpoint.detail}`)
  })

  if (rollbackRequired) {
    printCommands('Rollback commands:', commands.rollback)
  } else {
    printCommands('Promote commands:', commands.promote)
  }

  printCommands('Canary workflow commands:', commands.canary)

  if (rollbackRequired && mode === 'live') {
    console.error('\nRollback required in live mode.')
    process.exitCode = 2
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Canary drill failed: ${message}`)
  process.exit(1)
})
