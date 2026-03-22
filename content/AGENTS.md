# content/ — Blog Post Source Files

## Structure

```
content/
└── posts/
    └── {slug}/
        └── index.mdx     # Post content with YAML frontmatter
```

## Conventions

- One directory per post, named by slug
- Each directory contains a single `index.mdx` file
- Create via `pnpm new-post` (see [scripts/AGENTS.md](../scripts/AGENTS.md))
- Frontmatter fields: title, image, caption, summary, tags, created, updated
- Use `@/` imports for components, never relative paths
- Images referenced as `/filename.svg` (stored in `public/`)
- Wrap LaTeX in `<Math>` component for equation numbering
- All MDX components except `ArticleJsonLd` are auto-imported via `mdx-components.tsx`

## Series Support

Posts can belong to a series via frontmatter:

```yaml
series:
  name: "Series Name"
  order: 1
```

## Do Not

- Manually create metadata export files — the dynamic route (`app/blog/posts/[slug]/page.tsx`) handles metadata generation
- Use relative imports in MDX content
- Add post directories without an `index.mdx` file
