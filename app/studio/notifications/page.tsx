import type { Metadata } from 'next'
import { auth } from '@/lib/studio/auth'
import { redirect } from 'next/navigation'
import { NotificationList } from '@/components/studio/NotificationList'
import { createStudioMetadata, studioNoIndexRobots } from '@/lib/studio/metadata'

export const metadata: Metadata = createStudioMetadata({
  title: 'Notifications',
  description: 'Your activity notifications',
  path: '/studio/notifications',
  robots: studioNoIndexRobots,
})

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/studio')
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
        Notifications
      </h1>
      <NotificationList />
    </div>
  )
}
