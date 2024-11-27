---
title: |
  configs
---
<SwmSnippet path="/components.json" line="1">

---

&nbsp;

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.scss",
    "baseColor": "stone",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  },
  "iconLibrary": "lucide"
}
```

---

</SwmSnippet>

<SwmSnippet path="/contentlayer.config.ts" line="1">

---

&nbsp;

```typescript
// contentlayer.config.ts
import {
    defineDocumentType,
    makeSource,
    ComputedFields,
  } from 'contentlayer/source-files'
  import { remarkPluginCollection } from './lib/mdx/remark'
  import { rehypePluginCollection } from './lib/mdx/rehype'
  import readingTime from 'reading-time'
  import { getGitFileData } from './lib/git'
  import { getTableOfContents } from './lib/toc'
  
  const computedFields: ComputedFields = {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, ''),
    },
    toc: {
      type: 'json',
      resolve: async (doc) => getTableOfContents(doc.body.raw),
    },
    readingTime: {
      type: 'json',
      resolve: (doc) => readingTime(doc.body.raw),
    },
    wordCount: {
      type: 'number',
      resolve: (doc) => doc.body.raw.split(/\s+/g).length,
    },
    gitHistory: {
      type: 'json',
      resolve: async (doc) => await getGitFileData(doc._raw.sourceFilePath),
    },
  }
  
  export const Post = defineDocumentType(() => ({
    name: 'Post',
    filePathPattern: 'posts/**/*.mdx',
    contentType: 'mdx',
    fields: {
      title: { type: 'string', required: true },
      summary: { type: 'string', required: true },
      image: { type: 'string' },
      caption: { type: 'string' },
      created: { type: 'date', required: true },
      updated: { type: 'date' },
      tags: { type: 'list', of: { type: 'string' }, required: true },
      draft: { type: 'boolean', default: false },
      featured: { type: 'boolean', default: false },
      series: { type: 'string' },
      seriesIndex: { type: 'number' },
    },
    computedFields,
  }))
  
  export default makeSource({
    contentDirPath: 'content',
    documentTypes: [Post],
    mdx: {
      remarkPlugins: remarkPluginCollection,
      rehypePlugins: rehypePluginCollection,
    },
    disableImportAliasWarning: true,
  })
  
  // lib/toc.ts
  import { slugifyWithCounter } from '@sindresorhus/slugify'
  import { toString } from 'mdast-util-to-string'
  import { remark } from 'remark'
  import { visit } from 'unist-util-visit'
  
  interface TableOfContents {
    items?: TableOfContentsItem[]
  }
  
  interface TableOfContentsItem {
    title: string
    url: string
    items?: TableOfContentsItem[]
  }
  
  export async function getTableOfContents(
    content: string
  ): Promise<TableOfContents> {
    const slugify = slugifyWithCounter()
    const result = await remark().use(plugin).process(content)
  
    return result.data.toc
  
    function plugin() {
      return (tree: any, file: any) => {
        const items: TableOfContentsItem[] = []
        let heading: TableOfContentsItem | undefined
        let stack: TableOfContentsItem[] = []
  
        visit(tree, 'heading', (node) => {
          const title = toString(node)
          const level = node.depth
          const url = `#${slugify(title)}`
  
          heading = { title, url, items: [] }
  
          if (level === 2) {
            items.push(heading)
            stack = [heading]
          } else if (level === 3 && stack.length > 0) {
            const parent = stack[stack.length - 1]
            if (!parent.items) parent.items = []
            parent.items.push(heading)
          }
        })
  
        file.data.toc = { items }
      }
    }
  }
```

---

</SwmSnippet>

<SwmSnippet path="/instrumentation.ts" line="1">

---

&nbsp;

```typescript
import { registerOTel } from '@vercel/otel'
 
export function register() {
  registerOTel({ serviceName: 'next-app' })
}
```

---

</SwmSnippet>

<SwmSnippet path="/mdx-components.tsx" line="1">

---

&nbsp;

```tsx
import React, { useState } from "react";
import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Copy, Check, ExternalLink, Info, AlertCircle, Terminal } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip } from "@/components/ui/tooltip";

import GistWrapper from "@/components/GistWrapper";
import ClientSideLink from "@/components/ClientSideLink";
import TagLink from "@/components/TagLink";
import Math from "@/components/Math";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GistWrapperProps {
    url?: string;
    id?: string;
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        wrapper: ({ children }) => (
            <div className={cn(
                "prose prose-lg md:prose-xl lg:prose-2xl",
                "max-w-[90ch] lg:max-w-[100ch] xl:max-w-[110ch] 2xl:max-w-[120ch]",
                "mx-auto",
                "[&_strong]:no-underline", // Add this
                "[&_em]:no-underline",     // Add this
                "prose-strong:no-underline prose-em:no-underline", // Add this
                // Add styles for heading link positioning
                "[&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:relative",
                "[&_.anchor-link]:absolute [&_.anchor-link]:right-0",
                "[&_.anchor-link]:top-1/2 [&_.anchor-link]:-translate-y-1/2",
                "[&_.anchor-link]:opacity-0 [&_:hover_.anchor-link]:opacity-100",
                "[&_.anchor-link]:transition-opacity [&_.anchor-link]:duration-200",
                // Update heading link styles
                "[&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:w-full",
                "[&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:flex",
                "[&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:items-center",
                "[&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:justify-between",
                "[&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:gap-4",
                // Update anchor link styles
                "[&_.anchor-link]:static",
                "[&_.anchor-link]:transform-none",
                "[&_.anchor-link]:flex-shrink-0"
            )}>
                <article className="relative w-full max-w-none">
                    {children}
                </article>
            </div>
        ),

        h1: ({ children }) => (
            <h1 className={cn(
                "sm:text-4xl md:text-5xl lg:text-6xl",
                "mt-8 mb-4",
                "text-foreground dark:text-primary-foreground",
                "pb-4",
                "bg-clip-text bg-gradient-to-r from-primary via-primary-80 to-primary",
                "hover:text-transparent transition-colors duration-300",
                "relative"
            )}>
                {children}
            </h1>
        ),

        h2: ({ children }) => (
            <h2 className={cn(
                "scroll-m-20", 
                "text-2xl font-display font-semibold tracking-tight",
                "sm:text-3xl md:text-4xl lg:text-5xl",
                "mt-10 mb-4",
                "text-foreground dark:text-primary-foreground",
                "pb-2",
                "relative group",
                "transition-all duration-300 ease-out",
                "hover:text-primary",
                // Remove right padding since we're using flexbox
                "flex items-center justify-between gap-4"
            )}>
                <span className="flex-1 min-w-0">{children}</span>
            </h2>
        ),

        h3: ({ children }) => (
            <h3 className={cn(
                "scroll-m-20",
                "text-xl font-display font-semibold tracking-tight",
                "sm:text-2xl md:text-3xl",
                "mt-8 mb-4",
                "text-foreground dark:text-primary-foreground",
                "relative group",
                "hover:text-primary transition-colors duration-300",
                // Remove right padding and update flex layout
                "flex items-center justify-between gap-4"
            )}>
                <span className="flex-1 min-w-0">{children}</span>
            </h3>
        ),

        p: ({ children }) => (
            <p className={cn(
                "leading-7 [&:not(:first-child)]:mt-6",
                "text-base sm:text-lg",
                "text-muted-foreground dark:text-primary-foreground-80",
                "relative group",
                "transition-all duration-300",
                "hover:text-foreground dark:hover:text-primary-foreground",
                "after:content-[''] after:absolute after:bottom-0 after:left-0",
                "after:w-full after:h-[1px] after:bg-primary-10",
                "after:transform after:scale-x-0",
                "after:transition-transform after:duration-500",
                "group-hover:after:scale-x-100"
            )}>
                {children}
            </p>
        ),

        pre: ({ children }) => (
            <div className={cn(
                "relative my-8 rounded-xl overflow-hidden group",
                "bg-muted-30 dark:bg-card-50",
                "border border-border-50 dark:border-border-30",
                "transition-all duration-300",
                "hover:shadow-lg dark:hover:shadow-primary-10",
                "before:content-[''] before:absolute before:inset-0",
                "before:bg-gradient-to-r before:from-primary/5 before:to-transparent",
                "before:opacity-0 hover:before:opacity-100",
                "before:transition-opacity before:duration-300"
            )}>
                <div className="absolute top-3 right-3 z-10">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            navigator.clipboard.writeText(children?.toString() || '');
                        }}
                        className={cn(
                            "opacity-0 group-hover:opacity-100",
                            "transition-all duration-300",
                            "bg-background-80 dark:bg-background-50",
                            "hover:bg-background dark:hover:bg-background-70",
                            "backdrop-blur-sm",
                            "shadow-sm hover:shadow-md",
                            "transform hover:scale-105",
                            "border border-border-50"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <Copy className="h-4 w-4" />
                            <span className="hidden sm:inline">Copy</span>
                        </span>
                    </Button>
                </div>
                <pre className={cn(
                    "p-4 overflow-x-auto",
                    "bg-card-50 dark:bg-card-30",
                    "text-foreground dark:text-primary-foreground",
                    "rounded-xl",
                    "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
                    "hover:scrollbar-thumb-primary-50"
                )}>
                    {children}
                </pre>
            </div>
        ),

        table: ({ children }) => (
            <div className={cn(
                "my-8 w-full",
                "overflow-hidden rounded-xl",
                "border border-border-50",
                "bg-card-50 dark:bg-card-30",
                "transition-all duration-300",
                "hover:shadow-lg dark:hover:shadow-primary-10",
                "group"
            )}>
                <div className={cn(
                    "overflow-x-auto",
                    "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
                    "hover:scrollbar-thumb-primary-50"
                )}>
                    <table className={cn(
                        "w-full border-collapse",
                        "[&_tr:hover]:bg-muted-50 dark:[&_tr:hover]:bg-card-50",
                        "[&_tr]:transition-colors [&_tr]:duration-200",
                        "[&_th]:bg-muted-30 dark:[&_th]:bg-card-30",
                        "[&_th]:p-4 [&_td]:p-4",
                        "[&_th]:border-b [&_th]:border-border-50",
                        "[&_td]:border-b [&_td]:border-border-20",
                        "[&_th]:text-left [&_th]:font-medium",
                        "[&_th]:text-foreground dark:[&_th]:text-primary-foreground"
                    )}>
                        {children}
                    </table>
                </div>
            </div>
        ),

        code: ({ children }) => (
            <code className={cn(
                "relative rounded px-[0.4em] py-[0.2em]",
                "bg-muted text-accent-foreground",
                "font-mono font-medium text-[0.9em]", // Update font styling
                "before:hidden after:hidden",
                "break-words",
                "tracking-tight",
                "[font-variation-settings:'wght'_500]" // Add this for variable fonts
            )}>
                {children}
            </code>
        ),

        img: ({ src, alt }) => (
            <div className={cn(
                "relative my-8 rounded-xl overflow-hidden group",
                "transition-all duration-300",
                "hover:shadow-xl dark:hover:shadow-primary-20",
                "after:absolute after:inset-0",
                "after:bg-gradient-to-t after:from-black-20 after:to-transparent",
                "after:opacity-0 group-hover:after:opacity-100",
                "after:transition-opacity after:duration-300"
            )}>
                <Image
                    src={src || ''}
                    alt={alt || ''}
                    className={cn(
                        "rounded-xl",
                        "shadow-sm dark:shadow-none",
                        "transition-all duration-500",
                        "group-hover:scale-[1.02]",
                        "group-hover:shadow-xl dark:group-hover:shadow-2xl",
                        "hover:brightness-110"
                    )}
                    width={1200}
                    height={630}
                    quality={95}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAAAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4cHRocHCIkJR8nODE+MTAxODYzQEhcTkBEV0U3Ol9kaVpZWjY+SmxdbWdlXXJ5Y2f/2wBDARUXFx4cHhocHBodHiIeIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
                {alt && (
                    <div className={cn(
                        "absolute bottom-0 left-0 right-0",
                        "p-4 text-sm text-white-90",
                        "bg-gradient-to-t from-black-60 to-transparent",
                        "transform translate-y-full",
                        "transition-transform duration-300",
                        "group-hover:translate-y-0"
                    )}>
                        {alt}
                    </div>
                )}
            </div>
        ),

        // Replace custom 'strong' component with default
        strong: (props) => <strong {...props} />,

        // Replace custom 'em' component with default
        em: (props) => <em {...props} />,

        Alert: (props) => (
            <div className="my-8">
                <Alert {...props} className="dark:bg-card-30" />
            </div>
        ),

        Badge,

        Button,

        Card: (props) => (
            <div className="my-8">
                <Card {...props} className={cn(
                    props.className,
                    "dark:bg-card-30 dark:border-border-50"
                )} />
            </div>
        ),

        Tooltip,

        Separator: () => (
            <div className={cn(
                "my-12 relative flex items-center justify-center",
                "group"
            )}>
                {/* Left gradient line */}
                <div className={cn(
                    "flex-1 h-[1px]",
                    "bg-gradient-to-r from-transparent via-border to-border dark:via-border-50 dark:to-border-50",
                    "transform transition-transform duration-500",
                    "group-hover:scale-x-95 group-hover:translate-x-2"
                )} />

                {/* Center logo container */}
                <div className={cn(
                    "relative mx-4",
                    "w-8 h-8 sm:w-10 sm:h-10",
                    "rounded-full",
                    "border-2 border-border dark:border-border-50",
                    "bg-background dark:bg-card-30",
                    "overflow-hidden",
                    "transform transition-all duration-500",
                    "group-hover:scale-110 group-hover:rotate-180",
                    "group-hover:shadow-lg dark:group-hover:shadow-primary/20",
                    "group-hover:border-primary dark:group-hover:border-primary-50"
                )}>
                    <Image
                        src="/logo.webp"
                        alt="Logo"
                        width={40}
                        height={40}
                        className={cn(
                            "w-full h-full",
                            "object-cover",
                            "transition-all duration-500",
                            "group-hover:scale-110"
                        )}
                    />
                    {/* Glow effect */}
                    <div className={cn(
                        "absolute inset-0",
                        "bg-gradient-to-tr from-primary-20/0 via-primary-20/0 to-primary-20",
                        "opacity-0 group-hover:opacity-100",
                        "transition-opacity duration-500",
                        "pointer-events-none"
                    )} />
                </div>

                {/* Right gradient line */}
                <div className={cn(
                    "flex-1 h-[1px]",
                    "bg-gradient-to-l from-transparent via-border to-border dark:via-border-50 dark:to-border-50",
                    "transform transition-transform duration-500",
                    "group-hover:scale-x-95 group-hover:-translate-x-2"
                )} />

                {/* Decorative dots */}
                <div className={cn(
                    "absolute left-1/4 -translate-x-1/2",
                    "w-1 h-1 rounded-full",
                    "bg-border dark:bg-border-50",
                    "transition-all duration-500",
                    "group-hover:scale-150 group-hover:bg-primary"
                )} />
                <div className={cn(
                    "absolute right-1/4 translate-x-1/2",
                    "w-1 h-1 rounded-full",
                    "bg-border dark:bg-border-50",
                    "transition-all duration-500",
                    "group-hover:scale-150 group-hover:bg-primary"
                )} />
            </div>
        ),

        ClientSideLink,

        TagLink,

        Gist: ({ url, id }: GistWrapperProps) => (
            <div className="my-8 not-prose">
                <GistWrapper url={url} id={id} />
            </div>
        ),

        // Add specialized note/warning blocks
        Note: ({ children, type = "info" }) => {
            const icons = {
                info: Info,
                warning: AlertCircle,
                terminal: Terminal,
            };
            const Icon = icons[type as keyof typeof icons];
            
            const styles = {
                info: "border-blue-500-30 bg-blue-500/5 dark:border-blue-500-20 dark:bg-blue-500-10",
                warning: "border-yellow-500-30 bg-yellow-500/5 dark:border-yellow-500-20 dark:bg-yellow-500-10",
                terminal: "border-green-500-30 bg-green-500/5 dark:border-green-500-20 dark:bg-green-500-10",
            };
            
            return (
                <div className={cn(
                    "my-6 p-4 rounded-xl",
                    "border-2",
                    styles[type as keyof typeof styles],
                    "transition-all duration-300",
                    "hover:shadow-lg dark:hover:shadow-primary-10",
                    "relative overflow-hidden group",
                    "before:content-[''] before:absolute before:inset-0",
                    "before:bg-gradient-to-r before:from-primary/5 before:to-transparent",
                    "before:opacity-0 hover:before:opacity-100",
                    "before:transition-opacity before:duration-300"
                )}>
                    <div className="flex items-start gap-4 relative z-10">
                        <Icon className={cn(
                            "w-5 h-5 mt-1 flex-shrink-0",
                            "transition-transform duration-300 group-hover:scale-110",
                            type === "info" && "text-blue-500",
                            type === "warning" && "text-yellow-500",
                            type === "terminal" && "text-green-500"
                        )} />
                        <div className="prose-sm">{children}</div>
                    </div>
                </div>
            );
        },

        // Add collapsible sections
        Accordion: (props) => (
            <Accordion
                {...props}
                className={cn(
                    "my-6",
                    "border border-border-50 rounded-xl",
                    "bg-card-50 dark:bg-card-30"
                )}
            />
        ),
        AccordionItem,
        AccordionTrigger,
        AccordionContent,

        // Add tabs
        Tabs: (props) => (
            <Tabs
                {...props}
                className="my-6"
            />
        ),
        TabsList: (props) => (
            <TabsList
                {...props}
                className={cn(
                    "bg-muted-50 dark:bg-muted-10",
                    "border border-border-50"
                )}
            />
        ),
        TabsTrigger,
        TabsContent,

        // Add external link with icon
        ExternalLink: ({ href, children }) => (
            <Link
                href={href || ''}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    "inline-flex items-center gap-1",
                    "text-primary hover:text-primary-foreground",
                    "transition-all duration-300",
                    "relative group",
                    "after:content-[''] after:absolute after:bottom-0 after:left-0",
                    "after:w-full after:h-[1px] after:bg-primary",
                    "after:transform after:scale-x-0 after:origin-bottom-right",
                    "after:transition-transform after:duration-300",
                    "hover:after:scale-x-100 hover:after:origin-bottom-left",
                )}
            >
                {children}
                <ExternalLink className={cn(
                    "w-4 h-4",
                    "transition-all duration-300",
                    "group-hover:transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                    "group-hover:scale-110"
                )} />
            </Link>
        ),

        // Add code filename header
        CodeFilename: ({ children }) => (
            <div className={cn(
                "-mb-2 rounded-t-xl border-b-0",
                "bg-muted-30 dark:bg-card-50",
                "border border-border-50",
                "px-4 py-2 text-sm",
                "font-mono",
                "flex items-center gap-2",
                "transition-all duration-300",
                "group",
                "hover:bg-muted-50 dark:hover:bg-card-70",
                "hover:border-primary-30 dark:hover:border-primary-40"
            )}>
                <span className={cn(
                    "text-muted-foreground group-hover:text-foreground",
                    "transition-colors duration-300"
                )}>
                    {children}
                </span>
                <div className={cn(
                    "flex-1 h-[1px]",
                    "bg-gradient-to-r from-border-50 to-transparent",
                    "transition-opacity duration-300",
                    "opacity-0 group-hover:opacity-100"
                )} />
            </div>
        ),

        // Add scrollable code blocks
        ScrollableCode: ({ children, maxHeight = "400px" }) => (
            <ScrollArea 
                className={cn(
                    "rounded-xl border border-border-50",
                    "bg-card-50 dark:bg-card-30",
                    "transition-all duration-300",
                    "hover:border-primary-30 dark:hover:border-primary-40",
                    "hover:shadow-lg dark:hover:shadow-primary-10",
                    "group",
                    "[&_::-webkit-scrollbar-thumb]:bg-border-40",
                    "[&_::-webkit-scrollbar-thumb]:hover:bg-primary-40",
                    "[&_::-webkit-scrollbar-track]:bg-transparent",
                    "[&_::-webkit-scrollbar]:w-2 [&_::-webkit-scrollbar]:h-2",
                    "[&_::-webkit-scrollbar-thumb]:rounded-full",
                    "[&_::-webkit-scrollbar-track]:rounded-full"
                )}
                style={{ maxHeight }}
            >
                <div className={cn(
                    "relative",
                    "before:content-[''] before:absolute before:inset-0",
                    "before:bg-gradient-to-r before:from-primary/5 before:to-transparent",
                    "before:opacity-0 group-hover:before:opacity-100",
                    "before:transition-opacity before:duration-300"
                )}>
                    {children}
                </div>
            </ScrollArea>
        ),

        // Add callout component
        Callout: ({ children, icon, type = "default" }) => {
            const Icon = icon || Info;
            const styles = {
                warning: "border-yellow-500-50 bg-yellow-500/5 text-yellow-700 dark:text-yellow-300",
                error: "border-red-500-50 bg-red-500/5 text-red-700 dark:text-red-300",
                info: "border-blue-500-50 bg-blue-500/5 text-blue-700 dark:text-blue-300",
                success: "border-green-500-50 bg-green-500/5 text-green-700 dark:text-green-300",
                default: "border-primary-50 bg-primary/5 text-primary-foreground"
            };

            return (
                <div className={cn(
                    "my-6 p-4 rounded-xl",
                    "border-2 border-l-4",
                    styles[type as keyof typeof styles],
                    "transition-all duration-300",
                    "hover:shadow-lg",
                    "group relative overflow-hidden",
                    "backdrop-blur-[2px]",
                    "before:content-[''] before:absolute before:inset-0",
                    "before:bg-gradient-to-br before:from-white/5 before:to-transparent",
                    "before:opacity-0 hover:before:opacity-100",
                    "before:transition-opacity before:duration-300"
                )}> 
                    <div className="flex items-start gap-4 relative z-10">
                        <Icon className={cn(
                            "w-5 h-5 mt-1 flex-shrink-0",
                            "transition-transform duration-300",
                            "group-hover:scale-110 group-hover:rotate-3"
                        )} />
                        <div className="flex-1 prose-sm">{children}</div>
                    </div>
                </div>
            );
        },

        // Add details/summary component
        Details: ({ children, summary }) => (
            <details className={cn(
                "my-6 rounded-xl",
                "border border-border-50",
                "bg-card-50 dark:bg-card-30",
                "group/details",
                "transition-all duration-300",
                "hover:border-primary-30 dark:hover:border-primary-40",
                "hover:shadow-lg dark:hover:shadow-primary-10"
            )}>
                <summary className={cn(
                    "px-4 py-3",
                    "cursor-pointer select-none",
                    "font-medium",
                    "transition-all duration-300",
                    "hover:bg-muted-50 dark:hover:bg-card-50",
                    "flex items-center gap-2",
                    "marker:content-[''] marker:hidden",
                    "before:content-['▸'] before:inline-block",
                    "before:transition-transform before:duration-300",
                    "before:text-primary-70",
                    "[&::-webkit-details-marker]:hidden",
                    "[[open]>&]:before:transform [[open]>&]:before:rotate-90"
                )}>
                    <span className="flex-1">{summary}</span>
                    <div className={cn(
                        "h-[1px] flex-1",
                        "bg-gradient-to-r from-border-50 to-transparent",
                        "transition-opacity duration-300",
                        "opacity-0 group-hover/details:opacity-100"
                    )} />
                </summary>
                <div className={cn(
                    "p-4 pt-2",
                    "animate-accordion-down [[open]>&]:animate-accordion-up",
                    "transition-all duration-300"
                )}>
                    {children}
                </div>
            </details>
        ),

        Math,

        a: ({ href, children }) => {
            if (!href) return <span>{children}</span>;
            
            const isExternal = href.match(/^(https?:\/\/|mailto:|tel:)/i);
            const isAnchor = href.startsWith('#');
            
            const classes = cn(
                "relative group",
                "inline-flex items-center gap-1",
                "text-primary hover:text-primary-foreground",
                "transition-all duration-300",
                "decoration-primary/30",
                "hover:decoration-primary-foreground/50",
            );

            // Handle anchor links
            if (isAnchor) {
                return (
                    <a href={href} className={classes}>
                        {children}
                    </a>
                );
            }

            // Handle external links
            if (isExternal) {
                return (
                    <a 
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={classes}
                    >
                        {children}
                        <ExternalLink 
                            className={cn(
                                "w-3.5 h-3.5 ml-0.5",
                                "transition-all duration-300",
                                "opacity-50 group-hover:opacity-100",
                                "group-hover:transform",
                                "group-hover:translate-x-0.5",
                                "group-hover:-translate-y-0.5"
                            )}
                        />
                    </a>
                );
            }

            // Handle internal links
            return (
                <Link 
                    href={href}
                    className={classes}
                >
                    {children}
                </Link>
            );
        },

        ...components,
    };
}
```

---

</SwmSnippet>

<SwmSnippet path="/next-env.d.ts" line="1">

---

&nbsp;

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.

```

---

</SwmSnippet>

<SwmSnippet path="/next-sitemap.config.js" line="1">

---

&nbsp;

```javascript
/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: "https://w4w.dev",
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 50000,
  generateRobotsTxt: true,
  exclude: [
    "/favicon.icon",
    "/apple-icon.png",
    "/manifest.webmanifest",
    "/tags/*",
    "/logo.png",
    "/logo.webp",
    "opengraph.png",
    "twitter-image.png",
  ],
  generateIndexSitemap: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },
};

module.exports = config;

```

---

</SwmSnippet>

<SwmSnippet path="/next.config.mjs" line="1">

---

&nbsp;

```mjs
// next.config.mjs
import createMDX from '@next/mdx'
import withBundleAnalyzer from '@next/bundle-analyzer'

// Remark plugins
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkEmoji from "remark-emoji"
import remarkCodeTitles from "remark-code-titles"
import remarkToc from "remark-toc"
import remarkCodeBlocks from "remark-code-blocks"
import remarkCodeFrontmatter from "remark-code-frontmatter"
import remarkCodeImport from "remark-code-import"
import remarkCodeScreenshot from "remark-code-screenshot"
import remarkCodesandbox from "remark-codesandbox"
import remarkCustomHeaderId from "remark-custom-header-id"
import remarkDefinitionList from "remark-definition-list"
import remarkDocx from "remark-docx"
import remarkEmbedImages from "remark-embed-images"
import remarkExtendedTable from "remark-extended-table"
import remarkFrontmatter from "remark-frontmatter"
import { remarkAlert } from "remark-github-blockquote-alert"
import remarkHint from "remark-hint"
import remarkOembed from "remark-oembed"
import remarkSmartypants from "remark-smartypants"
import remarkSources from "remark-sources"
import remarkMdxMathEnhanced from "remark-mdx-math-enhanced"
import remarkMdxFrontmatter from "remark-mdx-frontmatter"

// Rehype plugins
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeKatex from "rehype-katex"
import rehypeCallouts from "rehype-callouts"
import rehypeCitation from "rehype-citation"
import rehypeColorChips from "rehype-color-chips"
import rehypeInferReadingTimeMeta from "rehype-infer-reading-time-meta"
import rehypePrismPlus from "rehype-prism-plus"
import rehypeSemanticBlockquotes from "rehype-semantic-blockquotes"

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  async rewrites() {
    return [
      {
        source: '/feed',
        destination: '/feed.xml',
        has: [{
          type: 'header',
          key: 'Accept',
          value: '(text/xml|application/xml|application/rss\\+xml)',
        }],
      },
      {
        source: '/rss',
        destination: '/feed.xml',
      },
      {
        source: '/rss.xml',
        destination: '/feed.xml',
      }
    ]
  },

  async headers() {
    return [
      {
        source: '/feed.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },

  webpack: (config, { dev, isServer }) => {

    // Add resolve configuration for third-party-capital
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        path: false
      }
    };

    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 90000,
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|next|@next|framer-motion)[\\/]/,
              priority: 40,
              enforce: true,
              reuseExistingChunk: true
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                return match ? `npm.${match[1].replace('@', '')}` : 'lib';
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true
            }
          }
        }
      }
    }

    return config
  },

  // Update Sass options at the root level
  sassOptions: {
    api: 'modern', // Use modern Sass API
    outputStyle: 'compressed',
  },

  experimental: {
    mdxRs: false,
    serverActions: {
      enabled: true
    },
    typedRoutes: true,
    optimizeCss: true,
    // esmExternals: 'loose',
  }
}

// Set up MDX configuration
const withMDX = createMDX({
  options: {
    format: 'mdx',
    remarkPlugins: [
      // Keep existing plugins but reorder them
      remarkFrontmatter,
      remarkMdxFrontmatter,
      remarkGfm,
      remarkMath,
      remarkEmoji,
      remarkCodeBlocks,
      remarkCodeFrontmatter,
      remarkCodeImport,
      remarkCodeScreenshot,
      remarkCodesandbox,
      remarkCustomHeaderId,
      remarkDefinitionList,
      [remarkDocx, { imageResolver: (src) => src.startsWith('http') ? src : src.startsWith('/') ? src : `/${src}` }],
      remarkEmbedImages,
      remarkExtendedTable,
      remarkAlert,
      remarkHint,
      remarkOembed,
      remarkSmartypants,
      remarkSources,
      remarkToc
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'append' }],
      rehypeKatex,
      rehypeCallouts,
      rehypeCitation,
      rehypeColorChips,
      rehypeInferReadingTimeMeta,
      [rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }],
      rehypeSemanticBlockquotes
    ]
  }
})

// Initialize bundle analyzer
const withBundleAnalytics = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

// Compose and export config
export default withBundleAnalytics(withMDX(nextConfig))
```

---

</SwmSnippet>

<SwmSnippet path="/next.config.mjs" line="1">

---

&nbsp;

```mjs
// next.config.mjs
import createMDX from '@next/mdx'
import withBundleAnalyzer from '@next/bundle-analyzer'

// Remark plugins
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkEmoji from "remark-emoji"
import remarkCodeTitles from "remark-code-titles"
import remarkToc from "remark-toc"
import remarkCodeBlocks from "remark-code-blocks"
import remarkCodeFrontmatter from "remark-code-frontmatter"
import remarkCodeImport from "remark-code-import"
import remarkCodeScreenshot from "remark-code-screenshot"
import remarkCodesandbox from "remark-codesandbox"
import remarkCustomHeaderId from "remark-custom-header-id"
import remarkDefinitionList from "remark-definition-list"
import remarkDocx from "remark-docx"
import remarkEmbedImages from "remark-embed-images"
import remarkExtendedTable from "remark-extended-table"
import remarkFrontmatter from "remark-frontmatter"
import { remarkAlert } from "remark-github-blockquote-alert"
import remarkHint from "remark-hint"
import remarkOembed from "remark-oembed"
import remarkSmartypants from "remark-smartypants"
import remarkSources from "remark-sources"
import remarkMdxMathEnhanced from "remark-mdx-math-enhanced"
import remarkMdxFrontmatter from "remark-mdx-frontmatter"

// Rehype plugins
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeKatex from "rehype-katex"
import rehypeCallouts from "rehype-callouts"
import rehypeCitation from "rehype-citation"
import rehypeColorChips from "rehype-color-chips"
import rehypeInferReadingTimeMeta from "rehype-infer-reading-time-meta"
import rehypePrismPlus from "rehype-prism-plus"
import rehypeSemanticBlockquotes from "rehype-semantic-blockquotes"

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  async rewrites() {
    return [
      {
        source: '/feed',
        destination: '/feed.xml',
        has: [{
          type: 'header',
          key: 'Accept',
          value: '(text/xml|application/xml|application/rss\\+xml)',
        }],
      },
      {
        source: '/rss',
        destination: '/feed.xml',
      },
      {
        source: '/rss.xml',
        destination: '/feed.xml',
      }
    ]
  },

  async headers() {
    return [
      {
        source: '/feed.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },

  webpack: (config, { dev, isServer }) => {

    // Add resolve configuration for third-party-capital
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        path: false
      }
    };

    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 90000,
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|next|@next|framer-motion)[\\/]/,
              priority: 40,
              enforce: true,
              reuseExistingChunk: true
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                return match ? `npm.${match[1].replace('@', '')}` : 'lib';
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true
            }
          }
        }
      }
    }

    return config
  },

  // Update Sass options at the root level
  sassOptions: {
    api: 'modern', // Use modern Sass API
    outputStyle: 'compressed',
  },

  experimental: {
    mdxRs: false,
    serverActions: {
      enabled: true
    },
    typedRoutes: true,
    optimizeCss: true,
    // esmExternals: 'loose',
  }
}

// Set up MDX configuration
const withMDX = createMDX({
  options: {
    format: 'mdx',
    remarkPlugins: [
      // Keep existing plugins but reorder them
      remarkFrontmatter,
      remarkMdxFrontmatter,
      remarkGfm,
      remarkMath,
      remarkEmoji,
      remarkCodeBlocks,
      remarkCodeFrontmatter,
      remarkCodeImport,
      remarkCodeScreenshot,
      remarkCodesandbox,
      remarkCustomHeaderId,
      remarkDefinitionList,
      [remarkDocx, { imageResolver: (src) => src.startsWith('http') ? src : src.startsWith('/') ? src : `/${src}` }],
      remarkEmbedImages,
      remarkExtendedTable,
      remarkAlert,
      remarkHint,
      remarkOembed,
      remarkSmartypants,
      remarkSources,
      remarkToc
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'append' }],
      rehypeKatex,
      rehypeCallouts,
      rehypeCitation,
      rehypeColorChips,
      rehypeInferReadingTimeMeta,
      [rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }],
      rehypeSemanticBlockquotes
    ]
  }
})

// Initialize bundle analyzer
const withBundleAnalytics = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

// Compose and export config
export default withBundleAnalytics(withMDX(nextConfig))
```

---

</SwmSnippet>

<SwmSnippet path="/package.json" line="1">

---

&nbsp;

```json
{
  "name": "personal-website",
  "version": "0.6.0",
  "private": true,
  "scripts": {
    "predev": "NODE_ENV=development ts-node -r tsconfig-paths/register --project tsconfig.scripts.json scripts/predev.ts",
    "dev": "next dev",
    "prebuild": "NODE_ENV=production ts-node -r tsconfig-paths/register --project tsconfig.scripts.json scripts/prebuild.ts",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "clean": "rimraf .next .cache node_modules/",
    "lclean": "rimraf .next .cache node_modules/.cache",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@babel/preset-typescript": "^7.26.0",
    "@floating-ui/react": "^0.26.27",
    "@fortawesome/fontawesome-svg-core": "^6.6.0",
    "@fortawesome/free-brands-svg-icons": "^6.6.0",
    "@fortawesome/free-regular-svg-icons": "^6.6.0",
    "@fortawesome/free-solid-svg-icons": "^6.6.0",
    "@fortawesome/react-fontawesome": "^0.2.2",
    "@giscus/react": "^3.0.0",
    "@mdx-js/loader": "^3.1.0",
    "@mdx-js/react": "^3.1.0",
    "@next/bundle-analyzer": "^15.0.3",
    "@next/eslint-plugin-next": "^15.0.3",
    "@next/mdx": "^13.5.7",
    "@next/third-parties": "^15.0.3",
    "@opentelemetry/api-logs": "^0.54.2",
    "@opentelemetry/instrumentation": "^0.54.2",
    "@opentelemetry/sdk-logs": "^0.54.2",
    "@radix-ui/react-accordion": "^1.2.1",
    "@radix-ui/react-checkbox": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-scroll-area": "^1.2.1",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.2",
    "@radix-ui/react-tooltip": "^1.1.4",
    "@theme-ui/color": "^0.17.1",
    "@theme-ui/mdx": "^0.17.1",
    "@theme-ui/prism": "^0.17.1",
    "@theme-ui/tailwind": "^0.17.1",
    "@tsparticles/all": "^3.6.0",
    "@tsparticles/react": "^3.0.0",
    "@tsparticles/slim": "^3.6.0",
    "@types/mdx": "^2.0.13",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@vercel/otel": "^1.10.0",
    "autoprefixer": "^10.4.20",
    "chalk": "^4.1.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "critters": "^0.0.20",
    "eslint": "^8",
    "eslint-config-next": "^14.2.5",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-mdx": "^3.1.5",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^5.0.0",
    "feed": "^4.2.2",
    "framer-motion": "^11.11.17",
    "fs": "^0.0.1-security",
    "fuse.js": "^7.0.0",
    "gray-matter": "^4.0.3",
    "json-loader": "^0.5.7",
    "katex": "^0.16.11",
    "lru-cache": "^10.0.0",
    "lucide-react": "^0.456.0",
    "mdx-bundler": "^10.0.3",
    "mermaid": "^11.4.0",
    "motion": "^11.11.14",
    "next": "^15.0.3",
    "next-sitemap": "^4.2.3",
    "next-themes": "^0.4.3",
    "postcss": "^8.4.49",
    "prism-react-renderer": "^2.4.0",
    "prism-themes": "^1.9.0",
    "react": "^18.3.1",
    "react-confetti": "^6.1.0",
    "react-custom-scroll": "^7.0.0",
    "react-dom": "^18.3.1",
    "react-icons": "^5.3.0",
    "react-immutable-proptypes": "^2.2.0",
    "react-katex": "^3.0.1",
    "react-particles": "^2.12.2",
    "react-scroll": "^1.9.0",
    "react-share": "^5.1.1",
    "react-syntax-highlighter": "^15.6.1",
    "reading-time": "^1.5.0",
    "rehype-autolink-headings": "^7.1.0",
    "rehype-callouts": "^1.3.0",
    "rehype-citation": "^2.2.2",
    "rehype-color-chips": "^0.1.3",
    "rehype-infer-reading-time-meta": "^2.0.0",
    "rehype-jargon": "^3.1.0",
    "rehype-katex": "^7.0.1",
    "rehype-mathjax": "^6.0.0",
    "rehype-mermaid": "^3.0.0",
    "rehype-prism": "^2.3.3",
    "rehype-prism-plus": "^2.0.0",
    "rehype-semantic-blockquotes": "^3.0.7",
    "rehype-slug": "^6.0.0",
    "rehype-sort-tailwind-classes": "^1.0.1",
    "remark": "^15.0.1",
    "remark-admonitions": "^1.2.1",
    "remark-code-blocks": "^2.0.1",
    "remark-code-frontmatter": "^1.0.0",
    "remark-code-import": "^1.2.0",
    "remark-code-screenshot": "^1.0.0",
    "remark-code-title": "^0.2.5",
    "remark-code-titles": "^0.1.2",
    "remark-codesandbox": "^0.10.1",
    "remark-collapse": "^0.1.2",
    "remark-contributors": "^7.0.0",
    "remark-custom-header-id": "^1.0.0",
    "remark-definition-list": "^2.0.0",
    "remark-docx": "^0.1.6",
    "remark-embed-images": "^5.0.0",
    "remark-emoji": "^5.0.1",
    "remark-extended-table": "^2.0.2",
    "remark-frontmatter": "^5.0.0",
    "remark-gfm": "^4.0.0",
    "remark-git-contributors": "^5.1.0",
    "remark-github": "^12.0.0",
    "remark-github-blockquote-alert": "^1.3.0",
    "remark-hint": "^1.0.10",
    "remark-html": "^16.0.1",
    "remark-math": "^6.0.0",
    "remark-mdx-frontmatter": "^5.0.0",
    "remark-mdx-math-enhanced": "^0.0.1-beta.3",
    "remark-oembed": "^1.2.2",
    "remark-prism": "^1.3.6",
    "remark-slug": "^7.0.1",
    "remark-smartypants": "^3.0.2",
    "remark-sources": "^1.1.0",
    "remark-toc": "^8.0.0",
    "remark-validate-links": "^12.1.1",
    "rimraf": "^5.0.10",
    "sass": "^1.80.7",
    "sass-loader": "^13.3.2",
    "super-react-gist": "latest",
    "tailwind-merge": "^2.5.4",
    "tailwindcss": "^3.4.14",
    "tailwindcss-animate": "^1.0.7",
    "third-party-capital": "^3.0.0",
    "tippy.js": "^6.3.7",
    "tsparticles": "^3.6.0",
    "tsparticles-engine": "^2.12.0",
    "tsparticles-slim": "^2.12.0",
    "typescript": "^5",
    "usehooks-ts": "^3.1.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.15",
    "@types/react-scroll": "^1.8.10",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "tsconfig-paths": "^4.2.0",
    "tsx": "^3.8.0"
  },
  "type": "commonjs",
  "ts-node": {
    "transpileOnly": true,
    "require": ["tsconfig-paths/register"],
    "compilerOptions": {
      "module": "CommonJS"
    }
```

---

</SwmSnippet>

<SwmSnippet path="/postcss.config.mjs" line="1">

---

&nbsp;

```mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;

```

---

</SwmSnippet>

<SwmSnippet path="/super-react-gist.d.ts" line="1">

---

&nbsp;

```typescript
declare module 'super-react-gist' {
  const SuperReactGist: any;
  export default SuperReactGist;
}

```

---

</SwmSnippet>

<SwmSnippet path="/tailwind.config.ts" line="1">

---

&nbsp;

```typescript
import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import typography from '@tailwindcss/typography';
import { ThemeConfig } from 'tailwindcss/types/config';
import { PluginAPI } from 'tailwindcss/types/config';

// Update the function definition to match Tailwind's expected types
function withOpacityValue(variable: string) {
  return ({ opacityValue }: { opacityValue: number | undefined }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
 
  addBase({
    ":root": newVars,
  });
}

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{html,js,jsx,ts,tsx,md,mdx,css,scss}',
    './components/**/*.{html,js,jsx,ts,tsx,md,mdx,css,scss}',
    './app/globals.scss',
    './app/variables.module.scss',
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'rgb(var(--primary-rgb))',
          foreground: 'var(--primary-foreground)',
          20: 'rgb(var(--primary-rgb) / 0.2)',
          30: 'rgb(var(--primary-rgb) / 0.3)',
        },
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
          '20': 'rgb(var(--accent-rgb) / 0.2)',
          '40': 'rgb(var(--accent-rgb) / 0.4)',
        },
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        'border-muted': 'var(--border-muted)',
        'math-bg': 'rgb(var(--math-bg) / <alpha-value>)',
        'math-bg-transparent': 'rgb(var(--math-bg-transparent) / <alpha-value>)',
        'math-border': 'rgb(var(--math-border) / <alpha-value>)',
        'math-controls-bg': 'var(--math-controls-bg)',
        'math-controls-hover': 'var(--math-controls-hover)',
        'math-controls-text': 'rgb(var(--math-controls-text) / <alpha-value>)',
        'math-controls-text-hover': 'rgb(var(--math-controls-text-hover) / <alpha-value>)',
        'math-inline': `rgb(var(--math-bg-transparent) / <alpha-value>)`,
        'math-text-color': 'var(--math-text-color)',
        'math-index-color': 'var(--math-index-color)',
        'math-inline-bg': 'var(--math-inline-bg)',
        'math-display-bg': 'var(--math-display-bg)',
        'math-display-number': 'var(--math-display-number)',
        'math-display-number-hover': 'var(--math-display-number-hover)',
        'post-header': {
          'gradient-from': 'var(--post-header-gradient-from)',
          'gradient-via': 'var(--post-header-gradient-via)',
          'gradient-to': 'var(--post-header-gradient-to)',
          'border': 'var(--post-header-border)',
        },
        'back-link': {
          'bg': 'var(--back-link-bg)',
          'hover-bg': 'var(--back-link-hover-bg)',
          'border': 'var(--back-link-border)',
        },
        // Add selection colors
        'selection-bg': 'var(--selection-bg)',
        'selection-text': 'var(--selection-text)',
        'selection-heading-bg': 'var(--selection-heading-bg)',
        'selection-heading-text': 'var(--selection-heading-text)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-code)', 'monospace'],
      },
      boxShadow: {
        glow: 'var(--shadow-glow)',
        soft: 'var(--shadow-soft)',
        'header': 'var(--shadow-header)',
        'math': 'var(--math-shadow)',
        'math-hover': 'var(--math-hover-shadow)',
        'post-header': 'var(--post-header-shadow)',
        'post-header-hover': 'var(--post-header-hover-shadow)',
        'back-link': 'var(--back-link-shadow)',
        'back-link-hover': 'var(--back-link-hover-shadow)',
      },
      borderRadius: {
        xl: 'var(--radius)',
      },
      backgroundImage: {
        'gradient-background': 'var(--gradient-background)',
        'gradient-text': 'var(--gradient-text)',
        'gradient-heading': 'var(--gradient-heading)',
        'gradient-separator': 'var(--gradient-separator)',
        'header-overlay': 'var(--gradient-header-overlay)',
        'gradient-border': 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
        'pagination-gradient': 'linear-gradient(135deg, var(--card-gradient-from), var(--card-gradient-to))',
      },
      animation: {
        fadeIn: 'fadeIn 1s forwards',
        float: 'float 4s ease-in-out infinite',
        glitch: 'glitch 2s ease-in-out infinite',
        gradient: 'gradient 8s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        rotateCube: "rotateCube 2s infinite linear",
        'code-blink': 'code-blink 1s ease-in-out infinite',
        'glitch-text': 'glitch 2.5s infinite',
        'glitch-skew': 'glitch-skew 2s infinite',
        'glitch-clip': 'glitch-clip 3s infinite linear alternate-reverse',
        'card-hover': 'card-hover 0.3s ease-in-out forwards',
        'card-float': 'card-float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'title-glow': 'title-glow 2s ease-in-out infinite alternate',
        'float-smooth': 'float-smooth 6s ease-in-out infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'subtitle-fade': 'subtitleFade 0.5s ease-out forwards',
        'subtitle-slide': 'subtitleSlide 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          to: { opacity: '1' },
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        gradientText: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        glitchNoise: {
          '0%': {
            clipPath: 'inset(40% 0 61% 0)',
            transform: 'translate(-20px, -10px)',
          },
          '20%': {
            clipPath: 'inset(92% 0 1% 0)',
            transform: 'translate(20px, 10px)',
          },
          '40%': {
            clipPath: 'inset(43% 0 1% 0)',
            transform: 'translate(-20px, 10px) skewX(3deg)',
          },
          '60%': {
            clipPath: 'inset(25% 0 58% 0)',
            transform: 'translate(20px, -10px) skewX(-3deg)',
          },
          '80%': {
            clipPath: 'inset(54% 0 7% 0)',
            transform: 'translate(-20px, 10px)',
          },
          '100%': {
            clipPath: 'inset(58% 0 43% 0)',
            transform: 'translate(20px, -10px)',
          },
        },
        rotateCube: {
          "0%": {
            transform: "rotateX(0deg) rotateY(0deg) rotateZ(0deg)",
          },
          "100%": {
            transform: "rotateX(360deg) rotateY(360deg) rotateZ(360deg)",
          },
        },
        'code-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'glitch': {
          '0%': { 
            textShadow: 'var(--glitch-shadow-1)'
          },
          '2%': { 
            textShadow: 'var(--glitch-shadow-2)'
          },
          '4%': {
            textShadow: 'var(--glitch-shadow-3)'
          },
          '6%': {
            textShadow: 'var(--glitch-shadow-1)'
          },
          '8%': {
            textShadow: 'var(--glitch-shadow-2)'
          },
          '10%, 100%': {
            textShadow: 'none'
          }
        },
        'glitch-skew': {
          '0%': { transform: 'skew(0deg)' },
          '2%': { transform: 'skew(3deg)' },
          '4%': { transform: 'skew(-3deg)' },
          '6%': { transform: 'skew(2deg)' },
          '8%': { transform: 'skew(-1deg)' },
          '10%, 100%': { transform: 'skew(0deg)' }
        },
        'card-hover': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' },
        },
        'card-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'title-glow': {
          'from': { textShadow: '0 0 20px var(--primary)' },
          'to': { textShadow: '0 0 30px var(--primary), 0 0 10px var(--primary)' }
        },
        'float-smooth': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        subtitleFade: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        subtitleSlide: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      transitionDuration: {
        '700': '700ms',
      },
      transitionTimingFunction: {
        'header': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      typography: (theme: (path: string) => string) => ({
        DEFAULT: {
          css: {
            color: 'var(--foreground)',
            maxWidth: '90ch',
            h1: {
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            },
            h2: {
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            },
            h3: {
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            },
            h4: {
              color: 'var(--foreground)', 
              fontFamily: 'var(--font-display)',
            },
            h5: {
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            },
            h6: {
              color: 'var(--foreground)', 
              fontFamily: 'var(--font-display)',
            },
            a: {
              color: 'var(--primary)',
              '&:hover': {
                color: 'var(--primary-foreground)',
              },
            },
            blockquote: {
              borderLeftColor: 'var(--border)',
              color: 'var(--muted-foreground)',
            },
            code: {
              color: 'var(--foreground)',
              backgroundColor: 'var(--muted)',
              borderRadius: '0.25rem',
              padding: '0.2em 0.4em',
              fontWeight: '500',
              fontFamily: 'var(--font-code)',
              fontSize: '0.9em',
              letterSpacing: '-0.025em',
              '&::before': {
                content: '""',
                display: 'none',
              },
              '&::after': {
                content: '""',
                display: 'none',
              }
            },
            hr: {
              borderColor: 'var(--border)',
            },
            strong: {
              color: 'var(--foreground)',
            },
            thead: {
              borderBottomColor: 'var(--border)',
              th: {
                color: 'var(--foreground)',
              }
            },
            tbody: {
              tr: {
                borderBottomColor: 'var(--border)',
              }
            },
            '@screen lg': {
              maxWidth: '100ch',
            },
            '@screen xl': {
              maxWidth: '110ch',
            },
            '@screen 2xl': {
              maxWidth: '120ch',
            },
            'h1,h2,h3,h4,h5,h6': {
              scrollMarginTop: theme('spacing.32'),
            },
            '.math-inline': {
              backgroundColor: 'var(--math-bg-transparent)',
              borderRadius: theme('borderRadius.md'),
              padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            '.katex-display': {
              overflow: 'auto hidden',
              width: '100%',
              textAlign: 'center',
              padding: `${theme('spacing.4')} 0`,
            },
          }
        },
        dark: {
          css: {
            color: theme('colors.foreground'),
            '[class~="lead"]': {
              color: theme('colors.foreground'),
            },
            a: {
              color: theme('colors.primary'),
            },
            strong: {
              color: theme('colors.foreground'),
            },
            'ol > li::before': {
              color: theme('colors.foreground'),
            },
            'ul > li::before': {
              backgroundColor: theme('colors.foreground'),
            },
            hr: {
              borderColor: theme('colors.border'),
            },
            blockquote: {
              color: theme('colors.foreground'),
              borderLeftColor: theme('colors.border'),
            },
            h1: {
              color: theme('colors.foreground'),
            },
            h2: {
              color: theme('colors.foreground'),
            },
            h3: {
              color: theme('colors.foreground'),
            },
            h4: {
              color: theme('colors.foreground'),
            },
            'figure figcaption': {
              color: theme('colors.foreground'),
            },
            code: {
              color: theme('colors.foreground'),
            },
            'a code': {
              color: theme('colors.foreground'),
            },
            pre: {
              color: theme('colors.foreground'),
              backgroundColor: theme('colors.background'),
            },
            thead: {
              color: theme('colors.foreground'),
              borderBottomColor: theme('colors.border'),
            },
            'tbody tr': {
              borderBottomColor: theme('colors.border'),
            },
          },
        },
        lg: {
          css: {
            maxWidth: '100ch',
          },
        },
        xl: {
          css: {
            maxWidth: '110ch',
          },
        },
        '2xl': {
          css: {
            maxWidth: '120ch',
          },
        },
      }),
      opacity: {
        '10': '0.1',
        '20': '0.2',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '80': '0.8',
        '90': '0.9',
      },
      backgroundOpacity: {
        '10': '0.1',
        '20': '0.2',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '80': '0.8',
        '90': '0.9',
      },
      borderOpacity: {
        '10': '0.1',
        '20': '0.2',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '80': '0.8',
        '90': '0.9',
      },
      backgroundColor: {
        'scrollbar-track': 'transparent',
      },
      textShadow: {
        'glow': '0 0 10px var(--primary), 0 0 20px var(--primary)',
        'glow-dark': '0 0 10px var(--primary-foreground), 0 0 20px var(--primary-foreground)',
      },
    },
  },
  future: {
    respectDefaultRingColorOpacity: true,
    disableColorOpacityUtilitiesByDefault: false,
  },
  plugins: [
    typography,
    addVariablesForColors,
    function({ addUtilities }: PluginAPI) {
      const newUtilities = {
        '.bg-gradient-text': {
          background: 'var(--gradient-text)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-size': '200% 200%',
        },
        '.shadow-soft': {
          boxShadow: 'var(--shadow-soft)',
        },
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
        },
        '.scrollbar-track-transparent': {
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
        },
        '.scrollbar-thumb-rounded': {
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
          },
        },
        '.text-shadow-glow': {
          textShadow: '0 0 10px var(--primary), 0 0 20px var(--primary)',
        },
        '.text-shadow-glow-dark': {
          textShadow: '0 0 10px var(--primary-foreground), 0 0 20px var(--primary-foreground)',
        },
      };
      addUtilities(newUtilities, {
        respectPrefix: true,
        respectImportant: true
      });
    },
    function({ addComponents, theme }: PluginAPI) {
      addComponents({
        '.bg-gradient-glow': {
          backgroundImage: `linear-gradient(to right, ${theme('colors.primary.DEFAULT')}, ${theme('colors.accent.DEFAULT')})`,
          opacity: '0.2',
        },
      });
    },
  ],
};

export default config;
```

---

</SwmSnippet>

<SwmSnippet path="/tsconfig.json" line="1">

---

&nbsp;

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "plugins": [
      {
        "name": "next"
      }
    ],
    "allowJs": true,
    "forceConsistentCasingInFileNames": true
  },
  "ts-node": {
    "transpileOnly": true,
    "require": ["tsconfig-paths/register"],
    "compilerOptions": {
      "module": "CommonJS",
      "moduleResolution": "Node"
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "scripts/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

---

</SwmSnippet>

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBcGVyc29uYWwtd2Vic2l0ZSUzQSUzQXd5YXR0b3dhbHNo" repo-name="personal-website"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
