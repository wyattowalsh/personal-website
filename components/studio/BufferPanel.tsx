'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeEditor } from './CodeEditor'

interface BufferPanelProps {
  activeBuffer: string
  onBufferChange: (buffer: string) => void
  bufferCode: Record<string, string>
  onBufferCodeChange: (buffer: string, code: string) => void
}

const BUFFERS = ['main', 'bufferA', 'bufferB', 'bufferC', 'bufferD'] as const
const BUFFER_LABELS: Record<string, string> = {
  main: 'Main',
  bufferA: 'Buffer A',
  bufferB: 'Buffer B',
  bufferC: 'Buffer C',
  bufferD: 'Buffer D',
}

export function BufferPanel({
  activeBuffer,
  onBufferChange,
  bufferCode,
  onBufferCodeChange,
}: BufferPanelProps) {
  return (
    <Tabs value={activeBuffer} onValueChange={onBufferChange} className="flex h-full flex-col">
      <TabsList className="h-8 shrink-0 rounded-none border-b border-border bg-transparent px-2">
        {BUFFERS.map((buf) => (
          <TabsTrigger
            key={buf}
            value={buf}
            className="rounded-none border-b-2 border-transparent px-2 py-1 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            {BUFFER_LABELS[buf]}
          </TabsTrigger>
        ))}
      </TabsList>
      {BUFFERS.map((buf) => (
        <TabsContent key={buf} value={buf} className="mt-0 flex-1">
          <CodeEditor
            code={bufferCode[buf] ?? ''}
            onChange={(code) => onBufferCodeChange(buf, code)}
            language="glsl"
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}
