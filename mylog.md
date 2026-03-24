# Codebase Analysis Log

**Date:** 2026-03-21
**Target:** w4w.dev — Next.js 16 personal website/blog
**Stack:** Next.js 16.1.6 · React 19 · TypeScript 5 · TailwindCSS 4.1 · MDX · Framer Motion · shadcn/ui
**Method:** 8 parallel skill-driven agents (analysis) + 3 parallel agents (implementation), consolidated below

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Honest Review — Code Quality Audit](#1-honest-review)
3. [Frontend Designer — UI/UX Audit](#2-frontend-designer)
4. [Security Scanner — Assessment](#3-security-scanner)
5. [Tech Debt Analyzer — Inventory](#4-tech-debt-analyzer)
6. [Host Panel — Expert Discussion](#5-host-panel)
7. [Research — Best Practices Analysis](#6-research)
8. [Learn — Pattern Capture](#7-learn)
9. [Skill Creator — Skill Audit](#8-skill-creator)
10. [Cross-Cutting Themes](#cross-cutting-themes)
11. [Unified Action Plan](#unified-action-plan)

---

## Executive Summary

**Overall health: Strong foundations, scattered investment.** The codebase demonstrates genuine engineering competence — timing-safe auth, HMAC sessions, Zod validation everywhere, 88+ tests, clean server/client boundaries. But the investment is misallocated: 6 WIP features are built but never rendered, 15 MDX components exist but aren't registered, Storybook is half-configured across two major versions, and dual MDX pipelines create routing conflicts. The site has the engine of a technical publication but the content catalog of 5 posts.

### Critical Issues (fix immediately)

| # | Issue | Source | Fix Effort |
|---|-------|--------|-----------|
| 1 | Production rate limiter uses global key — brute-force bypass | Security, Review | Trivial |
| 2 | Dual MDX pipelines (`@next/mdx` + `next-mdx-remote`) — route conflicts | Tech Debt | 2 hours |
| 3 | `new-post.ts` creates posts in wrong directory | Learn | 10 min |
| 4 | Metadata API returns full post content instead of metadata | Review, Learn | 1 line |
| 5 | CSP `'unsafe-inline'` in `script-src` neutralizes XSS protection | Security, Panel | Medium |

### Headline Numbers

| Metric | Value |
|--------|-------|
| Findings across all agents | 70+ |
| Critical/P0 issues | 5 |
| High/P1 issues | 12 |
| Dead code files identified | 24+ |
| Unused dependencies | 15+ |
| WIP features (built, not wired) | 6 of 7 |
| `"use client"` components | 70-79 |
| Test files | 10 (lib + API, zero component tests) |

---

## 1. Honest Review

**Agent:** `/honest-review` · **Confidence model:** Evidence-backed with file:line references
**Verdict:** No P0/P1 findings. Well-engineered codebase with 10 findings (3 significant, 4 moderate, 3 low).

### Strengths

- **Security architecture is excellent** — constant-time password comparison, HMAC sessions, rate limiting, origin validation, HttpOnly+SameSite cookies
- **API middleware pattern is clean** — every route gets correlation IDs, Sentry reporting, consistent error responses via `withErrorHandler`
- **Testing is thorough** — 88+ tests covering auth timing attacks, rate limits, UTF-8, analytics opt-out, device detection, API routes
- **Performance-conscious frontend** — `useReducedMotion`, rAF gating, debounced resize, 30fps physics throttle, `requestIdleCallback` particle loading

### Significant Findings (P2)

**HR-A-001. Metadata API returns full post content** (confidence: 0.95)
`app/api/blog/posts/[slug]/metadata/route.ts:24` calls `getPost(slug)` instead of `getPostMetadata(slug)`. Wastes bandwidth, exposes raw content on unauthenticated API.
Fix: One-line change to `getPostMetadata(slug)`.

**HR-A-002. Beacon endpoint rejects all local/dev traffic** (confidence: 0.90)
Requires `x-real-ip`/`x-forwarded-for` headers, returns 403 without them. In dev (no reverse proxy), analytics silently fail. Client swallows errors.
Fix: Fall back to `'127.0.0.1'` in non-production.

**HR-A-003. Origin validation duplicated** (confidence: 0.92)
`validateAdminRequestOrigin` (admin-auth.ts:22-47) and `checkOrigin` (beacon/route.ts:11-39) implement identical logic. Security fixes must be applied in both places.
Fix: Extract shared utility.

### Moderate Findings (P3)

- **HR-A-004.** 6 exported components never imported (dead code): SessionTracker, Webmentions, TableOfContents, SeriesNav, HeadingLink, RelatedPosts
- **HR-A-005.** `getPostsByTag` re-sorts on every call without caching (unlike `getAllPosts`)
- **HR-A-006.** `useTimeOnPage` doesn't reset refs on slug change — corrupts analytics across navigation
- **HR-A-007.** Production rate limiter uses shared `'admin-auth'` key instead of per-IP (all users share one counter)

### Low Findings

- **HR-A-008.** 100 animated particles in BlogTitle — performance concern on lower-end devices
- **HR-A-009.** SearchBar recreates Fuse.js on every query change (should only recreate when posts change)
- **HR-A-010.** `config` export in core.ts is eagerly evaluated — subtle trap for future dynamic config

---

## 2. Frontend Designer

**Agent:** `/frontend-designer` · **Scope:** Component architecture, styling, a11y, animation, typography

### Pre-Scan Metrics

| Metric | Result |
|--------|--------|
| TailwindCSS v4 CSS-first config | Clean — `@import "tailwindcss"` + `@theme {}`, no legacy `tailwind.config.js` |
| `"use client"` components | **70 files** |
| `@container` queries | **0** |
| `:has()` / `@supports` | **0** |
| `oklch` / `color-mix()` | **0** |
| Hardcoded hex colors in TSX | **30+** |
| Hardcoded `gray-*`/`slate-*` classes | **84 occurrences** |
| Default exports (contradicting guidelines) | **30 of 30** custom components |

### Critical

1. **Excessive `"use client"` footprint** — 70 components defeats the RSC model. `Header.tsx`, `PostCard.tsx` could be server components with interactive leaf nodes.
2. **100 animated `BackgroundParticles`** — each runs an independent Framer Motion animation loop. No throttling. 100 promoted GPU layers is excessive.
3. **HSL color tokens** — legacy shadcn/ui v0.x pattern. Modern approach uses `oklch` for perceptual uniformity.

### Warnings

4. **Zero `@container` queries** — all responsive design is viewport-scoped. Components like PostCard and SocialLink should respond to their container.
5. **30+ hardcoded hex values bypass design tokens** — Links.tsx, SocialLink.tsx, Mermaid.tsx, page.module.scss
6. **All custom components use default exports** — contradicts AGENTS.md ("Prefer named exports")
7. **PostHeader fetches metadata client-side via API** — should receive server props, not make a fetch waterfall
8. **ScrollIndicator uses inline `<style jsx>`** — should be in globals.scss or tailwind.css
9. **No `@supports` guards** for `backdrop-blur`, `clip-path`
10. **Duplicate `@keyframes`** — `shimmer`, `pulse`, `float`, `titleGradient` defined in multiple files

### Strengths

- Clean Tailwind v4 CSS-first config with `@theme {}` tokens
- Distinctive font pairing (Bricolage Grotesque + Monaspace Argon) with variable font support
- Comprehensive reduced motion support across nearly all animated components
- Solid accessibility: skip-to-content, aria-labels, aria-pressed, sr-only labels, semantic HTML
- 21 shadcn/ui primitives properly structured with Radix
- Fluid typography with `clamp()` values
- Production-grade dark mode via next-themes

---

## 3. Security Scanner

**Agent:** `/security-scanner` · **Methodology:** SAST + manual code review

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 3 |
| MEDIUM | 4 |
| LOW | 3 |
| INFO | 2 |

### CRITICAL

**C-1: Production rate limiter uses global key** (CWE-307, confidence: 0.95)
`lib/admin-auth.ts:49-57` — In production, `resolveAdminRateLimitKey()` returns `'admin-auth'` for ALL requests. One attacker hitting 5 attempts locks out all admin login globally for 15 minutes.
Fix: Use per-IP keys from `x-real-ip` (reliably set by Vercel).

### HIGH

**H-1: Mermaid `securityLevel: 'loose'`** (CWE-79, confidence: 0.85)
`components/Mermaid.tsx:64` — allows raw HTML in labels and `click` callbacks. SVG injected via `dangerouslySetInnerHTML`. If guest posts or user diagrams are ever supported, this is a direct XSS vector.
Fix: Change to `'strict'`.

**H-2: `ADMIN_PASSWORD` and `SESSION_SIGNING_KEY` undocumented** (CWE-1188, confidence: 0.90)
`.env.example` lists 15+ vars but omits the two most security-critical ones. Fallback signing key `'w4w-session-signing-key-dev'` is predictable.

**H-3: Admin page returns `null` instead of `redirect()`** (CWE-862, confidence: 0.75)
`app/admin/page.tsx:18` — server still processes and includes post stats in RSC payload even when unauthenticated.

### MEDIUM

- **M-1:** CSP `'unsafe-inline'` for both script-src and style-src
- **M-2:** In-memory rate limiter resets on serverless cold start
- **M-3:** GistEmbed interpolates unsanitized input into `srcdoc` template
- **M-4:** Webmention author photos used as `<img src>` without proxy (tracking pixel risk)

### Positive Controls

| Control | Assessment |
|---------|-----------|
| Timing-safe auth via SHA-256 digests | Excellent |
| HMAC sessions with nonce + expiry | Solid |
| Zod validation on all API routes | Comprehensive |
| Security headers (HSTS, X-Frame-Options, CSP, Permissions-Policy) | Well configured |
| Origin validation (origin/referer/sec-fetch-site) | Good CSRF defense |
| HttpOnly + SameSite=Strict cookies | Correct |
| Zero `eval()`, `Function()`, `child_process` | Clean |
| `rel="noopener noreferrer"` on external links | Consistent |

---

## 4. Tech Debt Analyzer

**Agent:** `/tech-debt-analyzer` · **Debt Score:** 78.4

### CRITICAL

**TD-01: Dual MDX pipeline** — both `@next/mdx` AND `next-mdx-remote` configured. Blog posts exist in TWO locations (`content/posts/` and `app/blog/posts/`). Route conflict risk. Three extra dependencies (`@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`) for potentially unused path.

**TD-02: Storybook version mismatch** — v8 addons mixed with v10 core packages. No `.storybook/` config, no `.stories.tsx` files. 8 devDependencies for unused tooling.

### HIGH

**TD-03:** 5 unused UI components + 5 unused Radix dependencies (~150KB)
**TD-04:** 15 MDX enhancement components never registered in `mdx-components.tsx`
**TD-05:** 6 WIP features built but not wired into any rendering pipeline
**TD-06:** `ts-node` + `ts-node-dev` + `tsconfig-paths` redundant with `tsx`
**TD-07:** Dead components: `GradientDivider`, `RisoMatrix`, `ParticleControls`

### MEDIUM

**TD-08:** `@types/glob` unnecessary with glob v13 (ships own types)
**TD-09:** Deprecated `getFingerprint` export (dead alias)
**TD-10:** Unused constants: `POSTS_PER_PAGE`, `MS_THRESHOLD`, `SECONDS_THRESHOLD`
**TD-11:** `useMousePosition` hook only referenced in docs
**TD-12:** No tests for `lib/core.ts`, `lib/logger.ts`, `lib/feed.ts`, `lib/rate-limit.ts`
**TD-13:** Zero component tests despite having `@testing-library/react` configured
**TD-14:** 13+ lint/type packages in `dependencies` instead of `devDependencies`

### WIP Features Status

| Feature | Integrated? | Tested? | Status |
|---------|:-----------:|:-------:|--------|
| ArticleTracker | Yes | No | **Complete** |
| RelatedPosts | No | Backend only | Built, not wired |
| TableOfContents | No | No | Built, not wired |
| SeriesNav | No | Backend only | Built, not wired |
| Webmentions | No | No | Built, not wired |
| SessionTracker | No | No | Built, not wired |
| HeadingLink | No | No | Built, not wired |
| ShareButtons | No | No | Built, not wired |

---

## 5. Host Panel

**Agent:** `/host-panel` · **Format:** Roundtable · **Experts:** 5

### Panelists

- **Dr. Rina Matsuda** — Next.js/React architect (Vercel DX, prev. Netflix)
- **Javier Reyes** — Security engineer (prev. Trail of Bits, Cloudflare)
- **Ama Okonkwo** — Accessibility lead (GOV.UK Design System, prev. Deque)
- **Marcus Chen** — Content engineer (prev. Gatsby core, Netlify CMS)
- **Priya Subramanian** — SRE (Vercel Edge, prev. AWS Lambda)

### Key Tensions Identified

1. **Server-first vs. client interactivity** — RSC architecture undermined by 70+ `'use client'` components
2. **Security posture vs. personal site scope** — HMAC auth is correctly engineered, but is the admin dashboard worth the attack surface?
3. **Build-time vs. runtime data** — `BackendService` re-parses MDX on every cold start in serverless
4. **Infrastructure-to-content ratio** — Engine of a publication, catalog of 5 posts
5. **Monitoring density** — 6+ telemetry systems (GTM, GA, Vercel Analytics, Speed Insights, WebVitals, Sentry) for a personal blog

### Emergent Question

> **"Should the admin dashboard exist at all?"**

If content is managed via MDX files committed to git (`pnpm new-post`), the admin dashboard is an alternative authoring path that conflicts with the primary one. This forces runtime patterns onto what would otherwise be a fully static site. Every architectural recommendation downstream depends on this product decision.

### Consensus Recommendations

1. **Serialize `BackendService` output to JSON at build time** — highest-leverage technical change
2. **Fix CSP before shipping admin dashboard** — `'unsafe-inline'` undermines security posture
3. **Consolidate to 2 telemetry systems** — Vercel Analytics + Sentry. Remove GTM + GA (30-50KB savings, simpler CSP)
4. **Ship or delete WIP features** — "almost done" is the worst state for code
5. **Decide the site's identity** — portfolio, publication, learning project, or product?

### Most Uncomfortable Insight

> Marcus: "The 8-phase modernization may have been productive procrastination — engineering as avoidance of the harder, more vulnerable work of writing."

> Javier: "The entire custom auth layer could be replaced by Vercel password protection. That would mean deleting some of the best-engineered code in the codebase."

---

## 6. Research

**Agent:** `/research` · **Confidence model:** Per-finding with source attribution

### Next.js 16 Compliance (confidence: 92%)

| Feature | Status | Recommendation |
|---------|--------|----------------|
| `use cache` directive | Not adopted | Replace manual BackendService caching |
| Partial Pre-Rendering (PPR) | Not enabled | Static shell + streaming dynamic content |
| React Compiler | Not enabled | Auto-memoization, eliminate manual `useMemo`/`useCallback` |
| Version currency | 16.1.6 | Upgrade to 16.2.x — 4x faster dev startup, SRI support |
| CSP nonces | Static headers | 16.2 supports SRI for JS files |

### State of the Art Comparison (confidence: 85%)

| Feature | Industry Best | This Project | Gap |
|---------|--------------|--------------|-----|
| Full-text search | Pagefind (zero-JS) | Fuse.js (client-side) | Pagefind recommended |
| View transitions | React 19.2 `<ViewTransition>` | Not implemented | Available now |
| Content collections | Velite/Contentlayer | Manual gray-matter + Zod | Works but more DX overhead |
| OG images | `next/og` dynamic per post | Static `/opengraph.png` | Missing |
| Activity/offscreen | React 19.2 `<Activity>` | Not used | Preload blog posts |

### BackendService Alternatives (confidence: 95%)

| Approach | Fit |
|----------|-----|
| `use cache` + Server Functions | Best for Next.js 16 |
| Build-time JSON manifest | Already partially done, complete the pattern |
| Content layer tools (Velite) | Most type-safe |
| Module-scoped lazy init | Simpler singleton |

**Recommended hybrid:** Keep `preprocess()` as build step → emit `content/.cache/posts.json` → read JSON in server components → use Pagefind for search → remove singleton class.

### Performance Findings

- **Bug:** `ParticlesBackground` init effect depends on `[currentTheme]` — causes full engine restart on theme change. Should be `[]`.
- Particle FPS should be 30, not 60 (decorative background, indistinguishable)
- `useScroll`/`useTransform` hooks fire on every scroll frame even with reduced motion (identity transforms still create listeners)
- `@tsparticles/basic` preset would be lighter than `@tsparticles/slim`

---

## 7. Learn

**Agent:** `/learn` · **Scope:** Recurring patterns, implicit conventions, anti-patterns, knowledge gaps

### Strong Patterns to Preserve

| Pattern | Where | Why |
|---------|-------|-----|
| API route template (withErrorHandler + ensurePreprocessed + jsonResponse) | All 10+ routes | Zero boilerplate drift, automatic observability |
| Promise deduplication in `ensurePreprocessed()` | lib/server.ts:56-80 | Prevents race conditions during cold starts |
| Type extraction layer (types.ts client-safe, core.ts server-only) | lib/types.ts, lib/core.ts | Clean server/client boundary |
| ErrorBoundary + Suspense sandwich | PostLayout.tsx | Sections fail independently |
| Correlation ID middleware | lib/core.ts:109-193 | End-to-end request tracing |
| Rate limiter factory | lib/rate-limit.ts | Testable, per-consumer isolation |

### Bugs Found

**`scripts/new-post.ts` creates posts in wrong directory:**
- Script: `app/blog/posts/{slug}/page.mdx`
- System reads: `content/posts/{slug}/index.mdx`
- Path and filename are both wrong.

### Anti-Patterns

- **Duplicated origin validation** — admin-auth.ts and beacon/route.ts implement identical logic
- **Manual Zod validation in beacon/auth routes** — bypasses `validateRequest` middleware that was built for this exact purpose
- **Inconsistent error response formats** — beacon route returns `{ error: 'Forbidden' }`, middleware returns `{ error: { message, code, details } }`
- **Inline type vs. extracted Props type** for slug route params (inconsistent across routes)
- **`'use client'` quoting** — 68 files use double quotes, 11 use single quotes (WIP components diverge)

### Undocumented Knowledge

| What | Where | Why it matters |
|------|-------|---------------|
| Promise dedup in ensurePreprocessed | server.ts:56-80 | Subtle correctness; easy to break |
| JSON-LD XSS sanitization | PostSchema.tsx | Security pattern, not documented |
| `server-only` stub for testing | vitest-server-only-stub.ts | Common Next.js gotcha |
| Analytics dual-channel architecture | lib/analytics.ts | Vercel track() + custom beacon |
| `PostMetadata` via Omit pattern | lib/types.ts | Server/client boundary convention |

---

## 8. Skill Creator

**Agent:** `/skill-creator` · **Scope:** Existing skill audit + gap analysis + recommendations

### Existing Skills

| Skill | Grade | Score | Project Relevance | Evals |
|-------|:-----:|:-----:|:-----------------:|:-----:|
| docs-steward | **A** | 90/100 | Medium | 23 files |
| blog-manager | **B** | 87/100 | **High** | 1 file (7 cases) |
| p5-sketch | **B** | 83/100 | **Low** | None |

### Issues

1. **blog-manager not symlinked** to `.claude/skills/` — Claude Code may not discover it
2. **p5-sketch is in the wrong project** — targets a p5.js studio sandbox, not this website
3. **blog-manager evals are thin** — 7 cases vs. docs-steward's 23 individual eval files
4. **blog-manager has agent dependency band-aid** — "Agent Dispatch Correction" block works around incorrect agent definitions

### Recommended New Skills

**1. `mdx-doctor`** (highest value) — Validate frontmatter schema, MDX component usage, internal link resolution, image existence. Modes: `validate`, `lint`, `check-components`, `check-links`, `report`.

**2. `component-forge`** (medium value) — Scaffold components following project conventions (server/client, hooks, UI). Modes: `create`, `wrap`, `audit`.

**3. `site-health`** (medium value) — Unified pre-deployment validation. Modes: `preflight`, `bundle`, `lighthouse`, `security`.

---

## Cross-Cutting Themes

### Theme 1: The Infrastructure-Content Inversion

Every agent surfaced this from a different angle:
- **Review:** 6 exported components never imported
- **Frontend:** 70 `"use client"` components for 5 blog posts
- **Panel:** "Engine of a publication, catalog of a Twitter thread"
- **Tech Debt:** 15 MDX components built but never registered
- **Research:** Recommendation algorithm for related posts across 5 items
- **Learn:** Sophisticated patterns (promise dedup, HMAC auth) for minimal content surface

### Theme 2: The "Almost Done" Problem

6 of 7 WIP features are built but not wired. 15 MDX components exist but aren't registered. Storybook is half-configured. The dual MDX pipeline suggests two authoring approaches coexist unresolved. The admin dashboard exists alongside `pnpm new-post`. Completing things is harder than starting them.

### Theme 3: Security is Genuine, Not Decorative

The auth system, input validation, error handling, and middleware patterns are correctly engineered — not cargo-culted. But the CSP gap (`'unsafe-inline'`) and the rate limiter bug (global key) undermine an otherwise strong posture. These are the kind of bugs that exist because the developer understood enough to build the system but didn't have an adversary review it.

### Theme 4: Modernization Lag

The codebase was modernized thoroughly but sits one version behind on Next.js (16.1.6 vs 16.2), hasn't adopted `use cache`, PPR, React Compiler, `oklch` colors, `@container` queries, or View Transitions. The modernization captured 2025 best practices; 2026 patterns are available.

---

## Unified Action Plan

### P0 — Fix Now (trivial, high impact)

| # | Action | Source | Effort |
|---|--------|--------|--------|
| 1 | Fix rate limiter: use per-IP keys in production | Security C-1, Review HR-A-007 | 5 min |
| 2 | Fix metadata API: `getPost` → `getPostMetadata` | Review HR-A-001, Learn 3B | 1 min |
| 3 | Fix `new-post.ts` path: `content/posts/` + `index.mdx` | Learn 3A | 10 min |
| 4 | Fix Mermaid: `securityLevel: 'strict'` | Security H-1 | 1 min |
| 5 | Fix `useTimeOnPage` ref reset on slug change | Review HR-A-006 | 2 min |
| 6 | Fix ParticlesBackground init effect: `[]` not `[currentTheme]` | Research | 1 min |

### P1 — This Sprint (hours, significant impact)

| # | Action | Source | Effort |
|---|--------|--------|--------|
| 7 | Resolve dual MDX pipeline — pick one | Tech Debt TD-01 | 2 hrs |
| 8 | Remove or configure Storybook (v10 consistent) | Tech Debt TD-02 | 30 min |
| 9 | Document `ADMIN_PASSWORD` + `SESSION_SIGNING_KEY` in .env.example | Security H-2 | 5 min |
| 10 | Fix admin page: `redirect()` not `return null` | Security H-3 | 2 min |
| 11 | Extract shared origin validation utility | Review HR-A-003, Learn 3C | 30 min |
| 12 | Wire WIP features or remove: RelatedPosts, TableOfContents first | Tech Debt TD-05, Panel | 2-4 hrs |
| 13 | Remove dead code: GradientDivider, RisoMatrix, ParticleControls, unused UI, unused MDX | TD-03, TD-04, TD-07 | 1 hr |
| 14 | Remove `ts-node`/`ts-node-dev`/`tsconfig-paths` | Tech Debt TD-06 | 15 min |
| 15 | Move lint/type packages to devDependencies | Tech Debt TD-14 | 15 min |
| 16 | Consolidate telemetry: keep Vercel Analytics + Sentry, remove GTM + GA | Panel | 1 hr |

### P2 — Next Sprint (days, modernization)

| # | Action | Source | Effort |
|---|--------|--------|--------|
| 17 | Upgrade to Next.js 16.2.x | Research | 1-2 hrs |
| 18 | Enable React Compiler | Research | 1 hr |
| 19 | Implement nonce-based CSP (replace `'unsafe-inline'`) | Security M-1, Panel | 4 hrs |
| 20 | Migrate color tokens from HSL to `oklch` | Frontend | 4 hrs |
| 21 | Adopt `use cache` directive for data fetching | Research | 4 hrs |
| 22 | Add tests for `core.ts`, `rate-limit.ts`, `feed.ts` | Tech Debt TD-12 | 4-6 hrs |
| 23 | Serialize BackendService to build-time JSON manifest | Panel, Research | 4 hrs |
| 24 | Replace Fuse.js with Pagefind | Research | 4 hrs |
| 25 | Add `@container` queries to PostCard, SocialLink | Frontend | 2 hrs |
| 26 | Replace hardcoded hex/gray/slate with semantic tokens | Frontend | 3 hrs |
| 27 | Symlink blog-manager skill to `.claude/skills/` | Skill Creator | 2 min |

### P3 — Backlog

| # | Action | Source | Effort |
|---|--------|--------|--------|
| 28 | Add component tests (SearchBar, CodeBlock, BlogTitle) | Tech Debt TD-13 | 6-8 hrs |
| 29 | Convert presentational components to server components | Frontend, Panel | 4 hrs |
| 30 | Implement View Transitions API | Research, Frontend | 4 hrs |
| 31 | Add dynamic OG images with `next/og` | Research | 4 hrs |
| 32 | Remove SCSS, consolidate into Tailwind CSS | Research | 8 hrs |
| 33 | Create `mdx-doctor` skill | Skill Creator | 4 hrs |
| 34 | Migrate default exports to named exports | Frontend, Learn | 2 hrs |
| 35 | Consolidate duplicate `@keyframes` | Frontend | 1 hr |
| 36 | Split `globals.scss` (856 lines) | Frontend | 2 hrs |
| 37 | Decide: admin dashboard vs. git-only authoring | Panel | Decision |
| 38 | Reduce particle count from 100 to 30 | Review, Frontend | 5 min |
| 39 | Reduce particle FPS from 60 to 30 | Research | 1 min |
| 40 | Replace `@radix-ui/react-icons` with Lucide equivalents | Tech Debt TD-18 | 15 min |

---

## Agent Performance Summary

| Agent | Skill | Duration | Findings | Tools Used | Tokens |
|-------|-------|----------|----------|------------|--------|
| review-agent | `/honest-review` | ~7 min | 10 | 78 | 121K |
| frontend-agent | `/frontend-designer` | ~2.5 min | 18 | 48 | 95K |
| security-agent | `/security-scanner` | ~10.7 min | 13 | 61 | 87K |
| techdebt-agent | `/tech-debt-analyzer` | ~14.3 min | 19 | 114 | 115K |
| panel-agent | `/host-panel` | ~7.3 min | 5 themes | 20 | 40K |
| research-agent | `/research` | ~7.2 min | 12 | 34 | 82K |
| learn-agent | `/learn` | ~11.3 min | 13 | 68 | 94K |
| skill-agent | `/skill-creator` | ~9.5 min | 9 | 38 | 57K |
| **Total** | **8 skills** | **~70 min** | **~95** | **~461** | **~691K** |

---

---

## Implementation Log

After analysis, 3 implementation agents were dispatched in parallel to execute fixes.

### P0 Fixes Applied (6 edits, all verified)

| Fix | File | Change |
|-----|------|--------|
| Rate limiter global key | `lib/admin-auth.ts` | Removed production branch returning `'admin-auth'`; now uses per-IP keys everywhere |
| Metadata API over-exposure | `app/api/blog/posts/[slug]/metadata/route.ts` | `getPost(slug)` → `getPostMetadata(slug)` |
| new-post wrong directory | `scripts/new-post.ts` | `app/blog/posts` → `content/posts`, `page.mdx` → `index.mdx` |
| Mermaid XSS surface | `components/Mermaid.tsx` | `securityLevel: "loose"` → `"strict"` |
| useTimeOnPage ref leak | `components/hooks/useTimeOnPage.ts` | Added `activeRef.current = 0; firedRef.current = new Set()` at effect start |
| Particles engine restart | `components/ParticlesBackground.tsx` | Init effect dependency `[currentTheme]` → `[]` (theme changes handled by separate effect) |

### @next/mdx Pipeline Removed

- Removed `createMDX` wrapper from `next.config.mjs`
- Simplified `pageExtensions` to `['js', 'jsx', 'ts', 'tsx']`
- Removed 5 duplicate `page.mdx` files from `app/blog/posts/`
- Blog posts now served exclusively via `next-mdx-remote` through `[slug]/page.tsx`

### 7 WIP Features Wired Into Rendering

| Feature | Wired Into | Behavior |
|---------|-----------|----------|
| **TableOfContents** | `PostLayout.tsx` | Sticky sidebar on desktop (xl:), collapsible disclosure on mobile |
| **SeriesNav** | `PostLayout.tsx` (via `PostLayoutSeriesNav`) | Before + after content; auto-hides if post is not in a series |
| **ShareButtons** | `PostLayout.tsx` (via `PostLayoutShareButtons`) | After content, centered |
| **RelatedPosts** | `PostLayout.tsx` | Bottom of post, after webmentions |
| **Webmentions** | `PostLayout.tsx` | After comments section |
| **HeadingLink** | `mdx-components.tsx` | Wired into h2, h3, h4 — anchor icon appears on hover |
| **SessionTracker** | `app/layout.tsx` | Global analytics tracker alongside WebVitals |

New wrapper components created: `PostLayoutSeriesNav.tsx`, `PostLayoutShareButtons.tsx`

### Security Housekeeping

- **Admin redirect**: `app/admin/page.tsx` — `return null` → `redirect('/')` for unauthenticated users
- **Shared origin validation**: Renamed to `validateRequestOrigin` in `lib/admin-auth.ts`; beacon route now imports shared function (deleted duplicate `checkOrigin`)
- **Env documentation**: Added `ADMIN_PASSWORD` and `SESSION_SIGNING_KEY` to `.env.example` with entropy guidance

### Dead Code Removed

- `components/GradientDivider.tsx` — never imported
- `lib/device.ts` — removed deprecated `getFingerprint` alias
- 5 duplicate `page.mdx` files in `app/blog/posts/`

### Test Fix

- Updated `blog-sub-routes.test.ts` mock to include `getPostMetadata` (required after metadata route fix)

### Verification Results

```
pnpm lint      → 0 errors, 10 warnings (pre-existing)
pnpm typecheck → 0 errors
pnpm test      → 163 passed, 0 failed
```

---

*Generated by 8 analysis agents + 3 implementation agents on 2026-03-21.*
