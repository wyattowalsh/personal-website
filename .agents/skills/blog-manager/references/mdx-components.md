# MDX Components

All names below are wired through the repo's root `mdx-components.tsx` and are available in blog post MDX without an import. If a name is not listed here, do **not** assume it exists.

## Automatic markdown behavior

Plain markdown already gets several upgrades from `mdx-components.tsx` and the post route:

- `#` through `####` headings get styled heading components with anchor links.
- Fenced code blocks render through `CodeBlock` automatically.
- Inline backticks are styled automatically.
- Markdown tables are wrapped in a scrollable table container.
- Markdown links are auto-classified:
  - `#hash` stays an in-page anchor
  - `https://...` opens in a new tab with an external-link icon
  - internal paths use `next/link`
- Markdown images and raw `<img>` tags use the shared image renderer.
- Math nodes are supported; explicit `<Math>` is still the clearest authoring option.

Use explicit MDX components only when they add something plain markdown cannot.

## Auto-available components

### Content helpers

| Component | Use it for | Minimal example |
|---|---|---|
| `Callout` | Emphasis box with built-in variants | `<Callout type="warning">Free proxy lists go stale fast.</Callout>` |
| `Details` | Collapsible section | `<Details summary="View source collections">...</Details>` |
| `ExternalLink` | Explicit external CTA link | `<ExternalLink href="https://example.com">Docs</ExternalLink>` |
| `ClientSideLink` | Plain client-side anchor when you want the explicit component | `<ClientSideLink href="/blog">Blog</ClientSideLink>` |
| `TagLink` | Linked tag pill | `<TagLink tag="Python" />` |

`Callout` supports `type="default" | "info" | "success" | "warning" | "error"`.

### Code, math, and diagrams

- `Gist` — embed a GitHub gist:
  - `<Gist url="https://gist.github.com/wyattowalsh/6a95b1c9ad6118b196336cffd5de4f72" />`
  - `id="user/id"` also works; `file="..."` is optional.
- `CodeFilename` — place a filename label immediately above a fenced code block:
  - `<CodeFilename>src/index.ts</CodeFilename>`
- `ScrollableCode` — wrap very long custom code/output blocks in a scroll area:

```mdx
<ScrollableCode maxHeight="320px">
  <pre><code>{`line 1
line 2`}</code></pre>
</ScrollableCode>
```

- `Math` — inline or display math:

```mdx
Inline <Math>E = mc^2</Math>

<Math display label="eq-energy">
  E = mc^2
</Math>
```

- `Mermaid` — render Mermaid diagrams with built-in zoom/download/fullscreen controls:

```mdx
<Mermaid chart={`flowchart LR
  A --> B`} title="Flow" />
```

### Layout and UI primitives

| Component | Use it for | Minimal example |
|---|---|---|
| `Badge` | Small status/tag labels | `<Badge variant="secondary">Async-First</Badge>` |
| `Button` | CTA button using shadcn button props | `<Button asChild variant="secondary"><a href="/contact">Get in touch</a></Button>` |
| `Card` | Framed content block | `<Card className="p-4">...</Card>` |
| `Alert` | Simple alert container | `<Alert variant="destructive">Breaking change ahead.</Alert>` |
| `Separator` | Visual divider | `<Separator />` |

Variants available from the underlying UI primitives:

- `Badge`: `default`, `secondary`, `destructive`, `outline`
- `Button`: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- `Alert`: `default`, `destructive`

### Compound components

#### Tabs

```mdx
<Tabs defaultValue="python">
  <TabsList>
    <TabsTrigger value="python">Python</TabsTrigger>
    <TabsTrigger value="cli">CLI</TabsTrigger>
  </TabsList>

  <TabsContent value="python">Python example...</TabsContent>
  <TabsContent value="cli">CLI example...</TabsContent>
</Tabs>
```

Available names: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.

#### Accordion

```mdx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Why this approach?</AccordionTrigger>
    <AccordionContent>Because it keeps the example compact.</AccordionContent>
  </AccordionItem>
</Accordion>
```

Available names: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`.

## Important limits

Only the names documented above are realistic no-import authoring choices.

Companion pieces such as `CardHeader`, `CardTitle`, `CardContent`, `AlertTitle`, `AlertDescription`, `TooltipTrigger`, and `TooltipContent` are **not** auto-imported here.

`Tooltip` root is present in `mdx-components.tsx`, but without `TooltipTrigger` and `TooltipContent` it is not a practical no-import option for posts. Treat tooltips as unavailable unless you explicitly import the missing pieces yourself.
