# Post Conventions

Canonical authoring rules for blog posts in this repo. These notes are grounded in the live site code, not aspirational agent docs.

## Post location and slug

- Author each post at `content/posts/{slug}/index.mdx`.
- `scripts/new-post.ts` creates that exact layout, and `app/blog/posts/[slug]/page.tsx` reads that exact file.
- The folder name is the slug and URL segment.
  - File: `content/posts/proxywhirl/index.mdx`
  - URL: `/blog/posts/proxywhirl`
- Do **not** add a `slug:` frontmatter field. Rename the directory if the slug changes.

## Frontmatter

Use this as the normal post template:

```mdx
---
title: "Post Title"
image: "/post-title-hero.svg"
caption: "Short caption or tagline"
summary: "One concise summary sentence for the post header and SEO."
tags: ["Project", "TypeScript"]
created: "2026-03-24"
updated: "2026-03-24"
series:
  name: "Series Name"
  order: 1
---
```

If the post is not part of a series, omit the entire `series` block.

### What the parser actually requires

`lib/server.ts` accepts these frontmatter fields:

| Field | Required by parser | Notes |
|---|---|---|
| `title` | Yes | Used by the post header and page metadata. |
| `created` | Yes | Use ISO date format: `YYYY-MM-DD`. |
| `updated` | No | Defaults to `created` during preprocessing if omitted. |
| `image` | No | Recommended; used for the hero/header image and Open Graph image. |
| `caption` | No | Shown as the hero image caption when present. |
| `summary` | No | Used in the header and SEO metadata. |
| `tags` | No | Defaults to `[]`; also used for metadata keywords. |
| `series` | No | Object with `name` and `order`. Enables series navigation. |

`pnpm new-post` scaffolds `image`, `caption`, `summary`, `tags`, `created`, and `updated` for you, so new authored posts should normally keep those fields even though some are optional in code.

## What frontmatter powers

- `components/PostHeader.tsx` renders the post hero, title, summary, dates, tags, and caption from post metadata.
- `app/blog/posts/[slug]/layout.tsx` generates page metadata and injects article JSON-LD automatically.
- `lib/metadata.ts` uses `title`, `summary`, `tags`, `created`, `updated`, and `image` for canonical/OG/Twitter metadata.
- `series` drives series navigation when present.

Because of that:

- Do **not** add `export const metadata = ...` inside a post.
- Do **not** import or use `components/PostSchema.tsx` from MDX for post schema.
- Do **not** hand-write JSON-LD `<script>` tags in posts.

If `image` is missing, metadata falls back to `/opengraph.png`, while the visual post header falls back to the site's default header art.

## Images

- Put hero images and in-body images under `public/`.
- Reference them with root-relative paths such as `/proxywhirl-hero.svg`.
- `pnpm new-post` defaults the hero image to `/${slug}-hero.svg`.
- During preprocessing, the site warns if a referenced hero image does not exist under `public/`.
- Standard markdown images work:

```mdx
![Architecture diagram](/proxywhirl-architecture.svg)
```

- Raw `<img src="/file.png" alt="..." />` also goes through the shared MDX image renderer.

## Body authoring rules

- Start the article body immediately after frontmatter.
- `pnpm new-post` currently inserts `# {title}` into the body, but the site already renders the main post title in `PostHeader`. In most cases, remove that duplicate H1 and start with prose or a `##` section heading.
- Use standard markdown for prose, links, tables, and fenced code blocks. The post route already enables GFM, syntax highlighting, slugged headings, and math support.
- Use only the auto-available helpers documented in `mdx-components.md`. If a component is not listed there, assume it is **not** auto-imported.
- If you intentionally add MDX imports, use `@/` aliases rather than relative paths (per `AGENTS.md`).
- Link to other posts with absolute paths like `/blog/posts/proxywhirl`, not relative traversals.

## Quick checklist

- Post file lives at `content/posts/{slug}/index.mdx`
- Directory name matches the intended URL slug
- Frontmatter dates are ISO strings
- Hero image path points into `public/`
- No manual metadata export or post-level JSON-LD
- No accidental duplicate H1 from the scaffold unless you truly want one
