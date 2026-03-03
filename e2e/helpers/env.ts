export function assertRequiredEnvVars(
  requiredVars: string[],
  env: Record<string, string | undefined> = process.env,
): void {
  const missing = requiredVars.filter((name) => !env[name]?.trim())
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
