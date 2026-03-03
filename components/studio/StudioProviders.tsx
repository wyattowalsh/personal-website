'use client'

import { SessionProvider } from 'next-auth/react'

export function StudioProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
