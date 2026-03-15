import type { Metadata } from 'next'
import { auth } from '@/lib/studio/auth'
import { redirect } from 'next/navigation'
import { NotificationList } from '@/components/studio/NotificationList'
import { StudioPageContainer, StudioPageHeader } from '@/components/studio/StudioShell'
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
    <StudioPageContainer className="max-w-2xl py-6">
      <StudioPageHeader heading="Notifications" />
      <NotificationList />
    </StudioPageContainer>
  )
}
