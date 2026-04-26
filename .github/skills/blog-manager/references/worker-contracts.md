# Worker Contracts

Stage-level contracts for the blog-manager pipeline. Use these rules when agent definitions and repo reality disagree.

## Shared Rules

- Published posts live at `content/posts/{slug}/index.mdx`.
- Shared route code lives at `app/blog/posts/[slug]/page.tsx` and `app/blog/posts/[slug]/layout.tsx`; workers do not author per-post files there.
- YAML frontmatter is the only authored metadata. No `ArticleJsonLd`. No `export const metadata` in post files.
- Handoff artifacts live under `.cache/blog-drafts/{slug}/`.
- The manager owns stage transitions. Workers should not invent new handoff files or silently skip to a downstream stage.
- Project compose requires a full existing-post style/taxonomy scan before drafting.

---

## blog-copilot

- **Inputs:** user intent, slug/topic, audience, constraints, mode, and `existing_post_path` when editing.
- **Reads:** reference docs, published posts in `content/posts/*/index.mdx`, and any existing draft artifacts in `.cache/blog-drafts/{slug}/`.
- **Outputs / handoff:** dispatch prompt for the next worker, checkpoint summaries, and an ensured `.cache/blog-drafts/{slug}/` directory when needed.
- **Allowed edits:** create or ensure the handoff directory exists.
- **Not allowed:** writing post content, publishing to `content/posts/`, or editing shared route files under `app/blog/posts/[slug]/`.

## blog-researcher

- **Inputs:** topic or theme, slug (for slug-based work), mode (`research` or `brainstorm`), audience, constraints, and optional source URLs.
- **Reads:** existing published posts in `content/posts/*/index.mdx`, tag usage, and any user-provided source material.
- **Project compose reads:** README/docs/package metadata/source tree facts for GitHub, URL, package, product, or local-path inputs; `references/style-profile.md`; `references/project-post-blueprint.md`.
- **Outputs / handoff:**
  - `research` / `refresh` support -> `.cache/blog-drafts/{slug}/research.md`
  - `brainstorm` -> `.cache/blog-drafts/brainstorm-{YYYY-MM-DD}.md`
- **Allowed edits:** only its own research artifacts under `.cache/blog-drafts/`.
- **Not allowed:** editing `draft.mdx`, `review.md`, published posts, `public/` assets, or shared app route files.
- **Project compose output:** `research.md` must include a source ledger, project facts, all-post style/taxonomy map, exemplar blend, central claims with confidence, claims to caveat/remove, and production-readiness evidence.

## blog-writer

- **Inputs:** slug, topic, audience, constraints, mode, optional `research.md`, optional `outline.md`, optional existing draft, and `existing_post_path` when revising a published post.
- **Reads:** `.cache/blog-drafts/{slug}/research.md`, `.cache/blog-drafts/{slug}/outline.md`, `.cache/blog-drafts/{slug}/draft.mdx`, and `content/posts/{slug}/index.mdx` when editing an existing post.
- **Project compose reads:** all existing posts through frontmatter and representative body sections, plus `references/style-profile.md` and `references/project-post-blueprint.md`.
- **Outputs / handoff:**
  - outline-only / draft planning -> `.cache/blog-drafts/{slug}/outline.md`
  - draft / short / staged revision -> `.cache/blog-drafts/{slug}/draft.mdx`
  - edit summary -> `.cache/blog-drafts/{slug}/review.md`
- **Allowed edits:** files inside `.cache/blog-drafts/{slug}/` only.
- **Not allowed:** directly mutating `content/posts/{slug}/index.mdx`, creating `app/blog/posts/{slug}/page.mdx`, or adding per-post metadata / JSON-LD blocks.
- **Project compose output:** `draft.mdx` must be publish-ready, match the selected all-post exemplar blend, include only source-backed central claims, and use verified MDX helpers only.

## blog-publisher

- **Inputs:** slug, mode (`publish`, `seo-only`, or `audit`), `publish_target`, approved `draft.mdx` for publish flows (including approved update / refresh work), and `existing_post_path` for existing-post work.
- **Reads:** `.cache/blog-drafts/{slug}/draft.mdx`, `.cache/blog-drafts/{slug}/review.md` when present, `content/posts/{slug}/index.mdx`, and referenced assets in `public/`.
- **Project compose reads:** `.cache/blog-drafts/{slug}/research.md` for source ledger, exemplar blend, and claim confidence.
- **Outputs / handoff:**
  - `publish` -> writes the approved `draft.mdx` to `content/posts/{slug}/index.mdx` for new posts and approved revisions
  - `seo-only` -> edits the target `content/posts/{slug}/index.mdx` in place
  - `audit` -> report only; no file writes unless a later fix pass is explicitly requested
- **Allowed edits:** create or update `content/posts/{slug}/index.mdx`, adjust frontmatter/body in that file, and run `pnpm lint && pnpm typecheck` plus `pnpm preprocess` when publishing.
- **Not allowed:** creating per-post files under `app/blog/posts/`, inventing `ArticleJsonLd` / `export const metadata`, or generating binary assets in `public/`.
- **Project compose checks:** block or return for revision when central claims lack evidence, project links are broken, helper usage is unsupported, or the draft ignores the all-post style profile.

---

## Artifact Ownership

- `research.md` belongs to `blog-researcher` and is the research handoff to `blog-writer`.
- `outline.md` belongs to `blog-writer` and is the outline-only / draft-planning handoff artifact.
- `draft.mdx` belongs to `blog-writer` until approval, then becomes the publish source for `blog-publisher` in new-post and approved-update flows.
- `review.md` belongs to `blog-writer` and is a human-readable delta summary, not the publish source of truth.
- `content/posts/{slug}/index.mdx` is the final authored artifact and should only be written by `blog-publisher` in publish/SEO flows.
