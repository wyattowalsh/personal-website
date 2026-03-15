'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { SketchEditor } from './SketchEditor'
import { SketchMeta } from './SketchMeta'
import { STUDIO_DEFAULT_CONFIG } from '@/lib/constants'
import type { EngineType, SketchConfig, SketchTemplate, Sketch } from '@/lib/studio/types'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SketchEditorPageProps {
  initialSketch?: Partial<Sketch>
  forkedFrom?: string
  templates?: SketchTemplate[]
}

export function SketchEditorPage({
  initialSketch,
  forkedFrom,
  templates = [],
}: SketchEditorPageProps) {
  const router = useRouter()
  const { data: session } = useSession()

  // Metadata state
  const [title, setTitle] = React.useState(initialSketch?.title ?? 'Untitled Sketch')
  const [description, setDescription] = React.useState(initialSketch?.description ?? '')
  const [tags, setTags] = React.useState<string[]>(initialSketch?.tags ?? [])

  // Save state
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>('idle')
  const [sketchId, setSketchId] = React.useState<string | null>(initialSketch?.id ?? null)

  // Refs for current code and engine (synced via callbacks, avoids duplicating state)
  const codeRef = React.useRef(initialSketch?.code ?? '')
  const engineRef = React.useRef<EngineType>(initialSketch?.engine ?? 'p5js')
  const configRef = React.useRef<SketchConfig>(initialSketch?.config ?? { ...STUDIO_DEFAULT_CONFIG })

  // Auto-clear "Saved" status after 3 seconds
  React.useEffect(() => {
    if (saveStatus !== 'saved') return
    const timeout = setTimeout(() => setSaveStatus('idle'), 3000)
    return () => clearTimeout(timeout)
  }, [saveStatus])

  const handleCodeChange = React.useCallback((code: string) => {
    codeRef.current = code
  }, [])

  const handleEngineChange = React.useCallback((engine: EngineType) => {
    engineRef.current = engine
  }, [])

  const handleConfigChange = React.useCallback((config: SketchConfig) => {
    configRef.current = config
  }, [])

  const handleMetaChange = React.useCallback((field: string, value: unknown) => {
    switch (field) {
      case 'title':
        setTitle(value as string)
        break
      case 'description':
        setDescription(value as string)
        break
      case 'tags':
        setTags(value as string[])
        break
    }
  }, [])

  const handleSave = React.useCallback(async () => {
    if (!session?.user) {
      // Not authenticated — prompt login
      router.push('/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    if (saveStatus === 'saving') return

    setSaveStatus('saving')

    try {
      const code = codeRef.current
      if (!code.trim()) {
        setSaveStatus('error')
        return
      }

      if (sketchId) {
        // Update existing sketch
        const res = await fetch(`/api/studio/sketches/${sketchId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim() || 'Untitled Sketch',
            description: description.trim(),
            code,
            tags,
            config: configRef.current,
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          console.error('[studio] save failed:', err)
          setSaveStatus('error')
          return
        }

        setSaveStatus('saved')
      } else {
        // Create new sketch
        const res = await fetch('/api/studio/sketches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim() || 'Untitled Sketch',
            description: description.trim(),
            code,
            engine: engineRef.current,
            tags,
            config: configRef.current,
            ...(forkedFrom ? { forkedFrom } : {}),
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          console.error('[studio] create failed:', err)
          setSaveStatus('error')
          return
        }

        const data = await res.json()
        setSketchId(data.id)
        setSaveStatus('saved')

        // Navigate to the edit URL for the new sketch
        router.replace(`/studio/${data.id}/edit`)
      }
    } catch (err) {
      console.error('[studio] save error:', err)
      setSaveStatus('error')
    }
  }, [session, saveStatus, sketchId, title, description, tags, forkedFrom, router])

  const handlePublish = React.useCallback(async () => {
    if (!session?.user) {
      router.push('/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    // Save first if needed, then set public
    if (saveStatus === 'saving') return
    setSaveStatus('saving')

    try {
      const code = codeRef.current
      if (!code.trim()) {
        setSaveStatus('error')
        return
      }

      if (sketchId) {
        // Update with isPublic: true
        const res = await fetch(`/api/studio/sketches/${sketchId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim() || 'Untitled Sketch',
            description: description.trim(),
            code,
            tags,
            config: configRef.current,
            isPublic: true,
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          console.error('[studio] publish failed:', err)
          setSaveStatus('error')
          return
        }

        setSaveStatus('saved')
      } else {
        // Create new sketch as public
        const res = await fetch('/api/studio/sketches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim() || 'Untitled Sketch',
            description: description.trim(),
            code,
            engine: engineRef.current,
            tags,
            config: configRef.current,
            ...(forkedFrom ? { forkedFrom } : {}),
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          console.error('[studio] create+publish failed:', err)
          setSaveStatus('error')
          return
        }

        const data = await res.json()
        const newId = data.id
        setSketchId(newId)

        // Now publish it
        const patchRes = await fetch(`/api/studio/sketches/${newId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublic: true }),
        })

        if (!patchRes.ok) {
          console.error('[studio] publish after create failed')
        }

        setSaveStatus('saved')
        router.replace(`/studio/${newId}/edit`)
      }
    } catch (err) {
      console.error('[studio] publish error:', err)
      setSaveStatus('error')
    }
  }, [session, saveStatus, sketchId, title, description, tags, forkedFrom, router])

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Metadata bar */}
      <div className="shrink-0 border-b border-border/60 bg-background/80 px-4 py-2.5">
        <SketchMeta
          title={title}
          description={description}
          tags={tags}
          onChange={handleMetaChange}
          editable
        />
      </div>

      {/* Editor */}
      <div className="min-h-0 flex-1">
        <SketchEditor
          initialCode={initialSketch?.code}
          initialEngine={initialSketch?.engine}
          initialConfig={initialSketch?.config ?? undefined}
          templates={templates}
          onCodeChange={handleCodeChange}
          onEngineChange={handleEngineChange}
          onConfigChange={handleConfigChange}
          onSave={handleSave}
          onPublish={handlePublish}
          saveStatus={saveStatus}
          className="h-full"
        />
      </div>
    </div>
  )
}
