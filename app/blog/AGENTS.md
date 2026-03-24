# app/blog/ — Blog Section

## Structure

```
blog/
├── layout.tsx            # Blog layout wrapper
├── page.tsx              # Blog index (post list)
├── posts/
│   └── [slug]/
│       ├── layout.tsx    # Shared metadata + JSON-LD from frontmatter
│       └── page.tsx      # Compiles content/posts/{slug}/index.mdx
└── tags/
    └── [tag]/
        └── page.tsx      # Posts filtered by tag
```

## Creating Posts

```bash
pnpm new-post
# or
pnpm new-post --title "Title" --tags "A,B"
```

Creates `content/posts/{slug}/index.mdx`.

## Source of Truth

- Author post content in `content/posts/{slug}/index.mdx`.
- `app/blog/posts/[slug]/page.tsx` reads and compiles that MDX file.
- `app/blog/posts/[slug]/layout.tsx` generates page metadata and injects structured data from frontmatter.
- Do not create or edit per-post route files under `app/blog/posts/`.

## MDX Frontmatter

```yaml
---
title: "Post Title"           # Required
image: "/post-hero.svg"       # Hero image (in public/)
caption: "Short tagline"      # Image caption
summary: "SEO description"    # Card/meta description
tags: ["Category", "Tech"]    # For filtering
created: "2026-01-15"         # ISO date
updated: "2026-01-15"         # ISO date
---
```

## MDX Content Guidelines

- Use `@/` imports for components
- Wrap LaTeX in `<Math>` component
- Code blocks get syntax highlighting automatically
- Use rehype-callouts for admonitions: `> [!NOTE]`
- Do not add `export const metadata`, `ArticleJsonLd`, or manual JSON-LD `<script>` tags inside posts

## Available MDX Components

All components auto-imported via `mdx-components.tsx` — no import needed:

### Layout & Structure
| Component | Usage |
|-----------|-------|
| `<Alert>` | Alert boxes with variants |
| `<Badge>` | Inline tags/labels |
| `<Button>` | Call-to-action buttons |
| `<Card>` | Content containers |
| `<Separator>` | Animated logo divider |
| `<Tooltip>` | Hover tooltips |

### Code & Math
| Component | Usage |
|-----------|-------|
| `<Math display={true}>` | Block LaTeX equation |
| `<Math display={false}>` | Inline LaTeX |
| `<CodeFilename>` | Code block filename header |
| `<ScrollableCode maxHeight="400px">` | Scrollable code container |

### Navigation & Links
| Component | Usage |
|-----------|-------|
| `<ExternalLink href="">` | External link with icon |
| `<ClientSideLink>` | Client-side navigation |
| `<TagLink tag="">` | Blog tag link |
| `<Gist url="" id="">` | GitHub Gist embed |

### Disclosure & Tabs
| Component | Usage |
|-----------|-------|
| `<Accordion>` + `<AccordionItem>` | Collapsible sections |
| `<Tabs>` + `<TabsList>` + `<TabsTrigger>` + `<TabsContent>` | Tab panels |
| `<Details summary="">` | Native `<details>` styled |

### Callouts
| Component | Usage |
|-----------|-------|
| `<Note type="info\|warning\|terminal">` | Info/warning boxes |
| `<Callout type="info\|warning\|error\|success">` | Styled callouts |

### Markdown callouts (rehype-callouts)
```md
> [!NOTE] Optional title
> Content here

> [!WARNING]
> Warning content

> [!TIP]
> Tip content
```

## Data Fetching

Posts loaded via `BackendService`:
```typescript
import { BackendService } from '@/lib/server'

await BackendService.ensurePreprocessed()
const backend = BackendService.getInstance()

const posts = await backend.getAllPosts()
const post = await backend.getPost(slug)       // null if not found
const adjacent = await backend.getAdjacentPosts(slug)  // { previous, next }
const tags = await backend.getAllTags()
```

See [lib/AGENTS.md](../../lib/AGENTS.md) for full API.
