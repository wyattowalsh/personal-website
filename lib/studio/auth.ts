import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import {
  AUTH_FAILURE_COOLDOWN_MINUTES,
  AUTH_FAILURE_THRESHOLD,
  clearAuthFailureThrottle,
  createAuthFailureThrottleKey,
  getAuthFailureThrottleState,
  getOrCreateUser,
  recordAuthFailure,
  type AuthFailureThrottleState,
} from './db'

const isProduction = process.env.NODE_ENV === 'production'
const sessionCookieName = isProduction
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token'

type AuthFailureReason = 'missing_account' | 'db_error'

async function persistAuthFailure(
  throttleKey: string,
  provider: string | null,
  reason: AuthFailureReason
): Promise<AuthFailureThrottleState | null> {
  try {
    const failureState = await recordAuthFailure(throttleKey)
    console.warn(JSON.stringify({
      event: 'auth_failure_recorded',
      provider,
      throttleKey,
      reason,
      failureCount: failureState.failureCount,
      throttled: failureState.throttled,
      retryAfterSeconds: failureState.retryAfterSeconds,
      threshold: AUTH_FAILURE_THRESHOLD,
      cooldownMinutes: AUTH_FAILURE_COOLDOWN_MINUTES,
      timestamp: new Date().toISOString(),
    }))
    return failureState
  } catch (err) {
    console.error(JSON.stringify({
      event: 'auth_failure_tracking_error',
      provider,
      throttleKey,
      reason,
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    }))
    return null
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const throttleKey = createAuthFailureThrottleKey(account?.provider, account?.providerAccountId)

      try {
        const throttleState = await getAuthFailureThrottleState(throttleKey)
        if (throttleState.throttled) {
          console.warn(JSON.stringify({
            event: 'auth_failure_throttled',
            provider: account?.provider ?? null,
            throttleKey,
            failureCount: throttleState.failureCount,
            retryAfterSeconds: throttleState.retryAfterSeconds,
            threshold: AUTH_FAILURE_THRESHOLD,
            cooldownMinutes: AUTH_FAILURE_COOLDOWN_MINUTES,
            timestamp: new Date().toISOString(),
          }))
          return false
        }
      } catch (err) {
        console.error(JSON.stringify({
          event: 'auth_failure_throttle_check_error',
          provider: account?.provider ?? null,
          throttleKey,
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
        }))
      }

      if (!account) {
        await persistAuthFailure(throttleKey, null, 'missing_account')
        return false
      }

      try {
        const dbUser = await getOrCreateUser(
          account.provider,
          account.providerAccountId,
          {
            name: user.name ?? null,
            email: user.email ?? null,
            image: user.image ?? null,
          }
        )
        // Attach the DB user ID so it's available in the jwt callback
        user.id = dbUser.id

        try {
          const cleared = await clearAuthFailureThrottle(throttleKey)
          if (cleared) {
            console.info(JSON.stringify({
              event: 'auth_failure_throttle_cleared',
              provider: account.provider,
              throttleKey,
              timestamp: new Date().toISOString(),
            }))
          }
        } catch (err) {
          console.error(JSON.stringify({
            event: 'auth_failure_throttle_clear_error',
            provider: account.provider,
            throttleKey,
            error: err instanceof Error ? err.message : String(err),
            timestamp: new Date().toISOString(),
          }))
        }

        return true
      } catch (err) {
        const failureState = await persistAuthFailure(throttleKey, account.provider, 'db_error')
        console.error(JSON.stringify({
          event: 'auth_error',
          provider: account.provider,
          throttleKey,
          error: err instanceof Error ? err.message : String(err),
          failureCount: failureState?.failureCount ?? null,
          throttled: failureState?.throttled ?? false,
          retryAfterSeconds: failureState?.retryAfterSeconds ?? 0,
          threshold: AUTH_FAILURE_THRESHOLD,
          cooldownMinutes: AUTH_FAILURE_COOLDOWN_MINUTES,
          timestamp: new Date().toISOString(),
        }))
        return false
      }
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  useSecureCookies: isProduction,
  cookies: {
    sessionToken: {
      name: sessionCookieName,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },
  trustHost: true,
  pages: {
    signIn: '/studio',
  },
})
