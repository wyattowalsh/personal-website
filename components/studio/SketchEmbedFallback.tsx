import Image from 'next/image'

interface SketchEmbedFallbackProps {
  thumbnailUrl?: string
  onLoad: () => void
}

export function SketchEmbedFallback({
  thumbnailUrl,
  onLoad,
}: SketchEmbedFallbackProps) {
  return (
    <button
      type="button"
      onClick={onLoad}
      className="flex h-full w-full items-center justify-center bg-muted transition-colors hover:bg-muted/80"
      aria-label="Load sketch"
    >
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt="Sketch preview"
          fill
          className="object-cover opacity-70"
        />
      ) : (
        <span className="text-sm text-muted-foreground">
          Click to load sketch
        </span>
      )}
    </button>
  )
}
