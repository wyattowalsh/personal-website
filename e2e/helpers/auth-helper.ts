import { encode } from 'next-auth/jwt'

const TEST_USER = {
  userId: '00000000-0000-4000-a000-000000000001',
  name: 'Test User',
  email: 'test@example.com',
  picture: null,
}

export async function createAuthCookie(): Promise<{
  name: string
  value: string
  domain: string
  path: string
}> {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is required for E2E auth')
  }

  const token = await encode({
    token: {
      ...TEST_USER,
      sub: TEST_USER.userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    },
    secret,
    salt: 'authjs.session-token',
  })

  return {
    name: 'authjs.session-token',
    value: token,
    domain: 'localhost',
    path: '/',
  }
}

export { TEST_USER }
