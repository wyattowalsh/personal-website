import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/studio/auth'
import { getSketchById } from '@/lib/studio/db'
import { SketchEditorPage } from '@/components/studio/SketchEditorPage'
import { p5Templates } from '@/lib/studio/templates'
import { shaderTemplates } from '@/lib/studio/shader-templates'
import { wgslTemplates } from '@/lib/studio/wgsl-templates'
import { createStudioMetadata, studioNoIndexRobots } from '@/lib/studio/metadata'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  return createStudioMetadata({
    title: 'Edit Sketch',
    description: 'Edit your Studio sketch',
    path: `/studio/${id}/edit`,
    robots: studioNoIndexRobots,
  })
}

export default async function EditSketchPage({ params }: PageProps) {
  const templates = [...p5Templates, ...shaderTemplates, ...wgslTemplates]
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/studio/${id}`)
  }

  const sketch = await getSketchById(id, session.user.id)

  if (!sketch) {
    notFound()
  }

  // Only the author can edit
  if (sketch.authorId !== session.user.id) {
    redirect(`/studio/${id}`)
  }

  return (
    <div className="h-[calc(100dvh-10rem)] md:h-[calc(100dvh-11rem)]">
      <SketchEditorPage
        initialSketch={sketch}
        templates={templates}
      />
    </div>
  )
}
