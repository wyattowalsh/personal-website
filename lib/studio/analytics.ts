/**
 * Studio analytics — server-safe event tracking.
 *
 * The main site's `lib/analytics.ts` is client-only (relies on `window.gtag`).
 * Studio API routes run server-side, so we emit structured JSON logs that
 * Vercel Log Drain / any observability pipeline can ingest directly.
 *
 * Every event is fire-and-forget — callers should never await or depend on
 * the result of these functions.
 */

function trackStudioEvent(
  event: string,
  properties?: Record<string, unknown>,
): void {
  try {
    console.log(
      JSON.stringify({
        event,
        source: 'studio',
        ...properties,
        timestamp: new Date().toISOString(),
      }),
    )
  } catch {
    // Swallow — analytics must never break the caller
  }
}

export const studioAnalytics = {
  sketchCreated: (props: { engine: string; forkedFrom?: string }) =>
    trackStudioEvent('studio_sketch_created', props),

  sketchPublished: (props: { sketchId: string; engine: string }) =>
    trackStudioEvent('studio_sketch_published', props),

  sketchForked: (props: { originalId: string; newId: string }) =>
    trackStudioEvent('studio_sketch_forked', props),

  sketchLiked: (props: { sketchId: string }) =>
    trackStudioEvent('studio_sketch_liked', props),

  sketchViewed: (props: { sketchId: string }) =>
    trackStudioEvent('studio_sketch_viewed', props),

  aiGenerate: (props: { engine: string; promptLength: number }) =>
    trackStudioEvent('studio_ai_generate', props),

  editorRun: (props: { engine: string }) =>
    trackStudioEvent('studio_editor_run', props),

  sketchExported: (props: {
    format: 'png' | 'svg' | 'code'
    engine: string
  }) => trackStudioEvent('studio_export', props),
}
