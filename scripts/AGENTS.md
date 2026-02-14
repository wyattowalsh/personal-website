# scripts/ — Build-time Preprocessing

## Files

| Script | Purpose | Command |
|--------|---------|---------|
| `index.ts` | Main preprocessing pipeline | `pnpm preprocess` |
| `new-post.ts` | Blog post scaffolding | `pnpm new-post` |
| `particles.ts` | Particle config generation | Called by index.ts |

## new-post.ts

Create new blog posts:

```bash
# Interactive mode
pnpm new-post

# CLI mode
pnpm new-post --title "My Post" --summary "Description" --tags "Tag1,Tag2"
```

Creates: `app/blog/posts/{slug}/page.mdx`

## index.ts (Preprocessing)

Runs automatically before `dev` and `build`:
- Scans `app/blog/posts/` for MDX files
- Parses frontmatter with gray-matter
- Builds search index (Fuse.js)
- Generates particle configurations

## Adding New Scripts

1. Create `scripts/my-script.ts`
2. Add to `package.json`:
   ```json
   "my-script": "tsx scripts/my-script.ts"
   ```

## Conventions

- Use TypeScript with `tsx` runner
- Import from `@/lib/*` for shared utilities
- Log progress with `logger` from `@/lib/core`
- Handle errors gracefully with try/catch
