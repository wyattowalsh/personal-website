---
name: 'Blog authoring'
description: 'Targeted rules for authored blog posts in content/posts/{slug}/index.mdx'
applyTo: 'content/posts/*/index.mdx'
---
# Blog authoring rules

- Author published posts only at `content/posts/{slug}/index.mdx`. Do not author them under `app/blog/posts/`.
- Start new posts with `pnpm new-post` (or `pnpm new-post --title "X" --tags "A,B"`). It scaffolds the real authored file at `content/posts/{slug}/index.mdx`.
- Treat YAML frontmatter as the only authored metadata. `app/blog/posts/[slug]/page.tsx` renders the post, and `app/blog/posts/[slug]/layout.tsx` owns route metadata and JSON-LD.
- Never add `export const metadata`, `ArticleJsonLd`, or other per-post metadata/JSON-LD wiring inside an authored post.
- Put hero and in-body images in `public/` and reference them with root-relative paths like `/my-post-hero.svg`.
- Before finishing authoring work, run `pnpm lint && pnpm typecheck`. After publish-related changes, run `pnpm preprocess`.
