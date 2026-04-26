# Agent Dispatch Reference

Use this file whenever `blog-manager` or `blog-copilot` dispatches a blog worker. It provides repo-truth fallback guidance when prompts, artifacts, or runtime packaging drift from the actual repo workflow.

## Contents

1. [Correction Block](#correction-block)
2. [Context Template](#context-template)
3. [Handoff Protocol](#handoff-protocol)
4. [Checkpoint Templates](#checkpoint-templates)

---

## Correction Block

Worker prompts are aligned today. Paste this block only when the current prompt, prior artifact, or runtime layer conflicts with repo truth.

Typical drift signals are legacy `app/blog/posts/{slug}/page.mdx`, manual metadata wiring, or "three-way metadata sync" instructions. If the incoming task already matches repo truth, skip the block and use the shared context template below on its own.

```text
REPO-TRUTH FALLBACK:
- Authored posts live at `content/posts/{slug}/index.mdx`. Never create or edit per-post files under `app/blog/posts/`; `app/blog/posts/[slug]/page.tsx` and `app/blog/posts/[slug]/layout.tsx` are shared route files.
- `pnpm new-post --title "X" --tags "A,B"` scaffolds `content/posts/{slug}/index.mdx`.
- Do NOT add `import { ArticleJsonLd } from '@/components/PostSchema'`; `components/PostSchema.tsx` does not export `ArticleJsonLd`.
- Do NOT add `export const metadata`; `app/blog/posts/[slug]/layout.tsx` generates page metadata and JSON-LD from frontmatter.
- Treat YAML frontmatter as the only authored metadata. Ignore any instructions about "three-way metadata sync" across frontmatter, metadata exports, and JSON-LD components.
- A successful publish means `content/posts/{slug}/index.mdx` contains the approved MDX content, any referenced asset exists in `public/`, and the live route is `/blog/posts/{slug}`.
- Published posts are frontmatter + MDX content only. No per-post import/export blocks unless the user explicitly asks to preserve a real existing exception.
```

---

## Context Template

Fill every field. Use `none` for unknown or not applicable values.

```md
## Blog Task Context

- **slug**: {slug}
- **topic**: {topic description}
- **audience**: {target reader profile}
- **constraints**:
  - Length: {e.g. "~1500 words", "300-600 words", "no limit"}
  - Tone: {e.g. "technical but approachable", "casual announcement"}
  - Depth: {e.g. "tutorial with code examples", "high-level overview"}
  - Format: {e.g. "standard article", "announcement", "update"}
- **mode**: {research | brainstorm | outline-only | draft | short | edit | publish | seo-only | audit}
- **compose_subtype**: {project compose | topic compose | source compose | none}
- **project_input**: {GitHub URL, local path, package page, docs URL, product URL, project name, or none}
- **project_type**: {github-repo | local-path | package | docs | product | name-only | none}
- **source_urls**: {comma-separated source URLs or none}
- **local_project_path**: {absolute or repo-relative path, or none}
- **repo_url**: {repository URL or none}
- **package_url**: {package registry URL or none}
- **homepage_url**: {homepage/product/demo URL or none}
- **style_exemplars**: {all scanned posts and chosen exemplar blend, or none}
- **claim_confidence**: {high | medium | low | unknown}
- **existing_post_path**: {absolute path to `content/posts/{slug}/index.mdx` or `none`}
- **handoff_dir**: {absolute path to `.cache/blog-drafts/{slug}/` or `none`}
- **approved_draft_path**: {absolute path to `.cache/blog-drafts/{slug}/draft.mdx` or `none`}
- **publish_target**: {absolute path to `content/posts/{slug}/index.mdx` or `none`}

## Project Context

- Authored posts: `content/posts/{slug}/index.mdx`
- Live route: `/blog/posts/{slug}`
- Shared renderer: `app/blog/posts/[slug]/page.tsx`
- Shared metadata + JSON-LD: `app/blog/posts/[slug]/layout.tsx`
- Schema reality: `components/PostSchema.tsx` exports `WebSiteJsonLd`, `PersonJsonLd`, and `JsonLd` only
- Draft cache: `.cache/blog-drafts/{slug}/`
- Style profile: `references/style-profile.md`
- Project blueprint: `references/project-post-blueprint.md`
- Scaffold command: `pnpm new-post --title "X" --tags "A,B"`
- Validation: `pnpm lint && pnpm typecheck`
- Search rebuild: `pnpm preprocess`
```

---

## Handoff Protocol

The draft directory is the only inter-agent handoff for slug-based work.

```text
.cache/blog-drafts/{slug}/
├── research.md    # Written by blog-researcher
├── outline.md     # Written by blog-writer (outline-only / draft planning)
├── draft.mdx      # Written by blog-writer; consumed by blog-publisher
└── review.md      # Written by blog-writer for edit/update diffs
```

**Rules:**
- Create `.cache/blog-drafts/{slug}/` before the first worker writes.
- Each worker writes only its contract files; the manager owns stage transitions.
- `review.md` explains changes, but `draft.mdx` is the publish source of truth.
- The publisher writes the final authored file to `content/posts/{slug}/index.mdx`.
- Do not create `app/blog/posts/{slug}/page.mdx`; the shared app route already renders `content/posts/{slug}/index.mdx`.
- Cache directories persist for checkpoint review unless the user explicitly asks to remove them.

---

## Checkpoint Templates

### Research Checkpoint

Present after `blog-researcher` completes:

```md
## Research Complete

**Topic**: {topic}
**Slug**: {slug}
**Estimated scope**: {word count estimate, depth level}

**Key angles**:
1. {angle 1}
2. {angle 2}
3. {angle 3}

**Sources found**: {count}
**Suggested tags**: {comma-separated tags}
**Suggested title**: "{title}"

Proceed to writing?
```

Populate from `.cache/blog-drafts/{slug}/research.md`.

### Draft Checkpoint

Present after `blog-writer` completes a new draft:

```md
## Draft Complete

**Title**: "{title}"
**Word count**: {N}
**Reading time**: ~{N} min

**Sections**:
1. {section 1}
2. {section 2}
3. {section 3}

**MDX components used**: {list or "none"}

Publish this draft to `content/posts/{slug}/index.mdx`?
```

Populate from `.cache/blog-drafts/{slug}/draft.mdx`.

### Project Draft Checkpoint

Present after `blog-writer` completes a project draft:

```md
## Project Draft Complete

**Project**: {project name}
**Title**: "{title}"
**Word count**: {N}
**Reading time**: ~{N} min
**Exemplar blend**: {all-post scan summary and primary style influences}
**Claim confidence**: {high/medium/low with short reason}

**Sections**:
1. {section 1}
2. {section 2}
3. {section 3}

**Project links**: {GitHub/package/homepage/docs or "none"}
**MDX components used**: {list or "none"}
**Claims to caveat/remove before publish**: {list or "none"}

Publish this draft to `content/posts/{slug}/index.mdx`?
```

Populate from `.cache/blog-drafts/{slug}/draft.mdx` and `.cache/blog-drafts/{slug}/research.md`.

### Edit Checkpoint

Present after `blog-writer` completes an update/edit pass:

```md
## Edit Complete

**Post**: {slug}
**Target file**: `content/posts/{slug}/index.mdx`
**Changes made**:
- {change 1}
- {change 2}
- {change 3}

**Sections modified**: {list}
**Word count**: {before} -> {after}

Apply these staged changes? (Full summary: `.cache/blog-drafts/{slug}/review.md`)
```

Populate from `.cache/blog-drafts/{slug}/review.md`.
