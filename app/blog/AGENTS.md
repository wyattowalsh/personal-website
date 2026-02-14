# app/blog/ — Blog Section

## Structure

```
blog/
├── layout.tsx            # Blog layout wrapper
├── page.tsx              # Blog index (post list)
├── posts/
│   ├── layout.tsx        # Post layout (MathProvider, Suspense)
│   ├── metadata.tsx      # Shared metadata generation
│   └── {slug}/
│       └── page.mdx      # Individual blog post
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

### Special
| Component | Usage |
|-----------|-------|
| `<RisoModuleMatrix>` | Riso template grid |
| `<RisoSaaSStack>` | SaaS stack visualizer |
| `<RisoSampleVariants>` | Sample variant grid |

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

Posts loaded via `services`:
```typescript
import { services } from '@/lib/services'

const posts = await services.posts.getAll()
const post = await services.posts.get(slug)  // null if not found
const { previous, next } = await services.posts.getAdjacent(slug)
```

See [lib/AGENTS.md](../../lib/AGENTS.md) for full API.
