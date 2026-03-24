# Validation Checklist

Portable checks to run before dispatching a worker and before final publish. Use these even if hooks are stale or only cover legacy paths.

## Pre-Dispatch Checks

| Check | How to verify | Pass condition |
|------|---------------|----------------|
| Resolve the authored post path | New post: `test ! -e content/posts/{slug}/index.mdx`  Existing post: `test -f content/posts/{slug}/index.mdx` | The next worker is targeting `content/posts/{slug}/index.mdx`, not a legacy `app/blog/posts/{slug}/page.mdx` path |
| Match the worker to the stage | Compare the requested mode with `worker-contracts.md` | Exactly one worker owns the next step |
| Prepare the handoff directory | `mkdir -p .cache/blog-drafts/{slug}` | The slug-scoped handoff directory exists before the worker writes |
| Check stage prerequisites | Research: topic/seed is present. Draft/edit: `research.md` or an existing post is available. Publish: `test -f .cache/blog-drafts/{slug}/draft.mdx` | The worker has the minimum inputs required for its stage |
| Paste the correction block | Copy the override block from `agent-dispatch.md` into the prompt | The prompt explicitly says: real post path, no `ArticleJsonLd`, no `export const metadata`, and final publish target |

---

## Pre-Publish Checks

| Check | How to verify | Pass condition |
|------|---------------|----------------|
| Approved draft exists | `test -f .cache/blog-drafts/{slug}/draft.mdx` | There is a staged draft to publish, or the mode is `seo-only` / `audit` and the existing post is the source |
| Draft header is frontmatter + content only | `sed -n '1,25p' .cache/blog-drafts/{slug}/draft.mdx` | The file starts with YAML frontmatter and does not introduce top-level `import` or `export const metadata` blocks |
| Parser-required frontmatter fields are present | Check the frontmatter for `title` and `created`. `updated` may be omitted because the parser falls back to `created`; `tags` may be omitted because the parser defaults to `[]`. | The post satisfies the actual parser contract in `lib/server.ts` and will preprocess successfully |
| Recommended new-post metadata follows repo conventions | For newly published posts, prefer `image`, `caption`, `summary`, `tags`, and `updated`. For existing legacy posts, preserve intentional omissions unless the user asked for a metadata refresh. | The post follows current authoring conventions without forcing parser-optional fields into older valid posts |
| Hero image resolves in `public/` when present | If `image:` is set, confirm the matching file exists under `public/`. For a new post, prefer adding one even though the parser does not require it. | Referenced social/SEO assets point at a real file, and missing optional images are handled intentionally |
| Scaffold placeholders are gone | Search the staged source file for `Start writing your post here...` before publish | No generated placeholder text remains |
| Final publish target is correct | Publish writes to `content/posts/{slug}/index.mdx`; shared route files stay unchanged | The final artifact is the authored MDX source file, not a per-post app route file |
| Repo validation passes | `pnpm lint && pnpm typecheck` | The post does not break the site build inputs |
| Search data is rebuilt after publish | `pnpm preprocess` | Search/indexed content sees the latest published post |

---

## Mode Notes

- **`audit`** is read-only. Stop after reporting findings unless the user explicitly asks for a fix pass.
- **`seo-only`** may edit `content/posts/{slug}/index.mdx` directly, but it still must respect the same frontmatter-only authoring rules.
- **New-post publish** may use `pnpm new-post` for scaffolding, but the final file must not keep the scaffold placeholder body.
