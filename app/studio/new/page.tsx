import type { Metadata } from 'next'
import { SketchEditorPage } from '@/components/studio/SketchEditorPage'
import { auth } from '@/lib/studio/auth'
import { getSketchById } from '@/lib/studio/db'
import type { EngineType, SketchConfig } from '@/lib/studio/types'
import { p5Templates } from '@/lib/studio/templates'
import { shaderTemplates } from '@/lib/studio/shader-templates'
import { wgslTemplates } from '@/lib/studio/wgsl-templates'
import { createStudioMetadata, studioNoIndexRobots } from '@/lib/studio/metadata'

export const metadata: Metadata = createStudioMetadata({
  title: 'Create Sketch',
  description: 'Create a new generative art sketch in Studio',
  path: '/studio/new',
  robots: studioNoIndexRobots,
})

export default async function NewSketchPage({
  searchParams,
}: {
  searchParams: Promise<{ fork?: string }>
}) {
  const templates = [...p5Templates, ...shaderTemplates, ...wgslTemplates]
  const params = await searchParams

  let forkData: {
    code: string
    engine: EngineType
    config: SketchConfig | null
    forkedFrom: string
  } | null = null

  if (params.fork) {
    try {
      const session = await auth()
      const sketch = await getSketchById(params.fork, session?.user?.id)
      if (sketch) {
        forkData = {
          code: sketch.code,
          engine: sketch.engine,
          config: sketch.config ?? null,
          forkedFrom: params.fork,
        }
      }
    } catch {
      /* fork fetch failed — start fresh */
    }
  }

  return (
    <div className="h-[calc(100dvh-10rem)] md:h-[calc(100dvh-11rem)]">
      <SketchEditorPage
        forkedFrom={forkData?.forkedFrom}
        initialSketch={
          forkData
            ? { code: forkData.code, engine: forkData.engine, config: forkData.config ?? undefined }
            : undefined
        }
        templates={templates}
      />
    </div>
  )
}
