'use client'

import * as React from 'react'
import { Copy, Check, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface EmbedDialogProps {
  sketchId: string
  thumbnailUrl?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmbedDialog({
  sketchId,
  thumbnailUrl,
  open,
  onOpenChange,
}: EmbedDialogProps) {
  const [copiedTab, setCopiedTab] = React.useState<string | null>(null)

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const iframeSnippet = `<iframe
  src="${siteUrl}/studio/embed/${sketchId}"
  width="400"
  height="400"
  frameborder="0"
  sandbox="allow-scripts"
></iframe>`

  const mdxSnippet = `<Sketch id="${sketchId}" height={400} />`

  const markdownSnippet = thumbnailUrl
    ? `[![Sketch](${siteUrl}${thumbnailUrl})](${siteUrl}/studio/${sketchId})`
    : `[View Sketch](${siteUrl}/studio/${sketchId})`

  const copyToClipboard = async (text: string, tab: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedTab(tab)
    setTimeout(() => setCopiedTab(null), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            Embed Sketch
          </DialogTitle>
          <DialogDescription>
            Copy one of the snippets below to embed this sketch.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="iframe">
          <TabsList>
            <TabsTrigger value="iframe">iframe</TabsTrigger>
            <TabsTrigger value="mdx">MDX</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>
          <TabsContent value="iframe">
            <div className="relative">
              <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                {iframeSnippet}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7"
                onClick={() => copyToClipboard(iframeSnippet, 'iframe')}
                aria-label={copiedTab === 'iframe' ? 'Copied iframe snippet' : 'Copy iframe snippet'}
              >
                {copiedTab === 'iframe' ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="mdx">
            <div className="relative">
              <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                {mdxSnippet}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7"
                onClick={() => copyToClipboard(mdxSnippet, 'mdx')}
                aria-label={copiedTab === 'mdx' ? 'Copied MDX snippet' : 'Copy MDX snippet'}
              >
                {copiedTab === 'mdx' ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="markdown">
            <div className="relative">
              <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                {markdownSnippet}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7"
                onClick={() => copyToClipboard(markdownSnippet, 'markdown')}
                aria-label={copiedTab === 'markdown' ? 'Copied Markdown snippet' : 'Copy Markdown snippet'}
              >
                {copiedTab === 'markdown' ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
