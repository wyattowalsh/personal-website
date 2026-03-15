import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSketchById } from '@/lib/studio/db'
import { SketchEmbed } from '@/components/studio/SketchEmbed'
import { createStudioMetadata, studioNoIndexRobots } from '@/lib/studio/metadata'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  return createStudioMetadata({
    title: 'Sketch Embed',
    description: 'Embedded Studio sketch view',
    path: `/studio/${id}`,
    robots: studioNoIndexRobots,
  })
}

export default async function EmbedPage({ params }: PageProps) {
  const { id } = await params
  const sketch = await getSketchById(id)

  if (!sketch || !sketch.isPublic) {
    notFound()
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <SketchEmbed code={sketch.code} height={630} />

      {/* Watermark */}
      <Link
        href={`/studio/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-[10px] text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        w4w.dev/studio
      </Link>
    </div>
  )
}
