import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/studio/auth'
import { getUserProfile } from '@/lib/studio/db'
import { ProfileEditor } from '@/components/studio/ProfileEditor'
import { StudioPageContainer, StudioPageHeader } from '@/components/studio/StudioShell'
import { createStudioMetadata, studioNoIndexRobots } from '@/lib/studio/metadata'

export const metadata: Metadata = createStudioMetadata({
  title: 'Profile Settings',
  description: 'Manage your Studio profile settings',
  path: '/studio/settings',
  robots: studioNoIndexRobots,
})

export default async function StudioSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/studio/settings')
  }

  const user = await getUserProfile(session.user.id)
  if (!user) redirect('/studio')

  return (
    <StudioPageContainer className="max-w-2xl py-6">
      <StudioPageHeader heading="Profile Settings" />
      <ProfileEditor user={user} />
    </StudioPageContainer>
  )
}
