# Admin, SEO, Performance, and Subtitle Refinement Plan

## Objective

Raise the codebase to the best practical current standard for a Next.js 16, React 19 personal website and blog while preserving the current visual language and avoiding unrelated rewrites.

This plan is optimized for parallel execution by independent subagent teams with strict file ownership, review gates, and full validation.

## Research Basis

- Next.js metadata, sitemap, and robots conventions support server-only metadata exports, metadata route handlers, canonicals, robots, OpenGraph, Twitter cards, and viewport declarations.
- Google Search Central recommends accurate sitemap `lastmod`, crawlable canonical URLs, Article/BlogPosting structured data, and representative high-resolution article images.
- web.dev Core Web Vitals targets remain LCP <= 2.5s, INP <= 200ms, and CLS <= 0.1 at the 75th percentile.
- W3C WAI table guidance supports chart alternatives as labelled figures plus accessible tabular data.
- MDN `prefers-reduced-motion` guidance supports replacing or disabling non-essential animation for users requesting reduced motion.

## Highest Priority Findings

- Broken MDX series links use relative `./slug` URLs that likely resolve under the current post path instead of sibling post URLs.
- Admin crawl blocking relies on page metadata but `robots.ts` does not disallow `/admin/`, and there is no route-level `X-Robots-Tag` defense-in-depth.
- Post social metadata uses arbitrary hero/frontmatter images even though a dynamic post OG image route exists.
- Site URL fallback is inconsistent between canonical config and IndexNow/Search Console helper code.
- Tag URL encoding is inconsistent across sitemap/static params/UI links.
- Homepage initial client bundle pulls below-fold `PostCard`, `ThemeAwareHero`, and `RisoHero` code into the critical path.
- Homepage H1 and hero effects use expensive animated gradient/drop-shadow/blur work around likely LCP candidates.
- Particle effects are deferred but can still create post-load INP risk through `tsparticles` engine/plugin initialization.
- Runtime preprocessing via `BackendService.ensurePreprocessed()` remains a cold-start/TTFB risk unless static route behavior is intentionally locked.
- Subtitle registry association is strong, but visual snapshot coverage does not lock all 22 bespoke subtitle designs, and homepage smoke coverage is missing.
- The main landing title gradient animation ignores reduced-motion settings.
- Admin `AnimatedContainer` still uses `inert` for entrance animation, hiding not-yet-visible sections from keyboard and assistive technologies.
- Admin mobile drawer claims modal behavior while the public root header remains outside the inert boundary.
- Analytics rollup refresh deletes stale dimensions but not stale daily rows when a refreshed day disappears from PostHog results.
- Missing Turso rollup config currently surfaces as generic refresh error/500 instead of setup state.
- Search Console setup state can report OAuth gaps even when service-account credentials are complete.
- Playwright subtitle geometry gate exists but is not wired into CI.
- There is no coverage reporting, browser-level SEO metadata smoke, axe gate, or strong performance budget gate.

## Execution Rules

- Do not commit or push unless explicitly requested.
- Do not touch `.env*`, `node_modules`, `.next`, `pnpm-lock.yaml`, or secrets.
- Keep public API and route behavior stable unless explicitly listed below as semantic change.
- Keep `/admin*` free of any `Back to Blog` link/button.
- Use `@/` aliases and existing UI primitives.
- Same-file changes must be assigned to only one subagent team at a time.
- Every team must return changed files, tests run, evidence, and residual risks before the next wave proceeds.

## Wave 0: Baseline and Guardrails

Run before edits.

- Team 0A, worktree steward: capture `git status`, `git diff --stat`, untracked files, and current validation baseline.
- Team 0B, route/perf baseline: run `pnpm build`, record route static/dynamic output, and capture bundle/Lighthouse baseline if tooling is available.
- Team 0C, SEO baseline: snapshot current `robots.txt`, `sitemap.xml`, representative page heads, and representative post JSON-LD.
- Team 0D, subtitle baseline: run `pnpm test:subtitle-geometry` or document why browser dependencies are unavailable.

Exit gate:
- Baseline state is recorded.
- No unowned same-file edit conflict exists.
- Validation commands and browser availability are known.

## Wave 1: Correctness and SEO Foundations

These lanes are parallel-safe if file ownership is respected.

- Team 1A, MDX internal links: update series links in `content/posts/regularized-linear-regression-models-pt*/index.mdx` to canonical absolute `/blog/posts/...` URLs and add link validation coverage if a link checker exists.
- Team 1B, crawl controls: update `app/robots.ts` to disallow `/admin/`; add route-level `X-Robots-Tag: noindex, nofollow, noarchive` for `/admin/:path*` via the narrowest supported Next mechanism.
- Team 1C, site URL consistency: centralize IndexNow/Search Console fallback URL usage on `getConfig().site.url` or a shared helper; fix `app/api/admin/indexnow/route.ts` and `app/admin/lib/free-admin-dashboard.ts` fallback drift.
- Team 1D, tag URL normalization: add a small tag href helper and apply it to `components/PostCard.tsx`, `components/PostHeader.tsx`, `components/TagLink.tsx`, `components/TagsGrid.tsx`, `app/sitemap.ts`, and tag static params if needed.
- Team 1E, post social images: make `lib/metadata.ts` prefer `/blog/posts/${slug}/opengraph-image` for OG/Twitter unless a dedicated validated `ogImage` field exists; update dynamic OG alt text in `app/blog/posts/[slug]/opengraph-image.tsx`.
- Team 1F, sitemap freshness: replace volatile `new Date()` `lastModified` values with stable build/content-derived dates where possible; keep dynamic dates only where the page truly changes on generation.
- Team 1G, structured data quality: enhance article schema image handling for absolute URLs and optional multiple image aspect ratios when assets exist.

Exit gate:
- SEO metadata/schema/sitemap tests pass.
- Rendered head smoke confirms canonical, robots, OG/Twitter, and JSON-LD for `/`, `/blog`, one post, and one tag.
- Admin crawl controls are verified at metadata and header/robots levels.

## Wave 2: Homepage Core Web Vitals and Critical Path

These lanes are parallel-safe if the homepage critical-path team owns `HomePageClient` while visual CSS teams own CSS modules.

- Team 2A, homepage component split: split `components/HomePageClient.tsx` so above-fold hero does not statically import below-fold `PostCard`, `ThemeAwareHero`, or `RisoHero` code.
- Team 2B, latest writing island: make the latest-writing section server-rendered where possible, or defer it with a client island after viewport/idle without CLS.
- Team 2C, LCP paint simplification: remove or defer initial H1 `filter`/animated gradient/drop-shadow work in `components/LandingTitle.tsx` and `components/landing-title/subtitle.module.css`; keep initial LCP paint static.
- Team 2D, hero glow CSS: reduce large above-fold blur/filter effects in `app/page.module.css`; prefer static radial gradients or lower blur radii.
- Team 2E, particles INP: default particle density to reduced on mobile/low-power contexts, lazy-load controls, and delay engine initialization until a safer idle/visibility window.
- Team 2F, image defaults: lower MDX image quality from 95 to a measured 75-85 default unless per-image override exists; preserve dimensions/aspect ratio.
- Team 2G, route static intent: after build output confirms behavior, explicitly lock `/` and eligible blog routes as static/revalidated if supported without changing semantics.

Exit gate:
- `pnpm build` still shows intended static/dynamic routes.
- Lighthouse or browser trace confirms no regression in LCP/INP/CLS for `/` and `/blog`.
- Particle initialization has no long task above 50ms in measured trace, or remaining risk is documented.

## Wave 3: Subtitle Design Integrity

This wave directly targets the faux professional titles and their associated designs.

- Team 3A, registry contract tests: render every `forcedSubtitleId` and assert DOM `data-subtitle-id`, visible `h2.textContent`, `data-subtitle-lane`, and audit metadata match `LANDING_TITLE_RENDERERS`/`LANDING_TITLE_SUBTITLE_OPTIONS`.
- Team 3B, visual snapshot expansion: add focused screenshots for every subtitle id, or at minimum one per renderer scene plus every long/high-risk title, across dark/light and desktop/mobile.
- Team 3C, homepage smoke: add `/` smoke geometry coverage for desktop, 320px mobile, light/dark, and reduced motion so the actual homepage hero container is tested, not only `/lab/subtitles`.
- Team 3D, reduced-motion computed styles: assert all subtitle descendants and `.enhancedTitleLanding` have no active CSS animation under reduced motion.
- Team 3E, stale selector cleanup: update or remove stale `.sceneCognitive` and `.scenePlatform` selectors in `components/landing-title/systems.module.css` if they no longer map to emitted scene classes.
- Team 3F, design association report: produce a generated or test-backed inventory mapping each faux title to id, lane, renderer, scene class, and screenshot name.

Exit gate:
- `pnpm test:subtitle-geometry` passes.
- Every subtitle has explicit id/text/lane/renderer association coverage.
- Every bespoke design has either screenshot coverage or documented risk acceptance.

## Wave 4: Admin Correctness, Accessibility, and Data Trust

These lanes must avoid overlapping files unless sequenced.

- Team 4A, rollup replacement correctness: in `app/admin/lib/analytics-rollups.ts`, delete or zero stale `analytics_rollup_days` rows inside the same chunk replacement batch; add regression tests.
- Team 4B, rollup missing config: make `refreshAnalyticsRollups()` return `missing_config` with concrete `missingEnv` before opening a client; ensure API route returns setup-state response instead of generic 500.
- Team 4C, Search Console setup state: prefer complete service-account config, then complete OAuth config, then report partial missing keys; align setup panel with runtime behavior.
- Team 4D, data freshness: use `visitors.generatedAt` or combined provider freshness for admin “Updated” timestamps instead of render time.
- Team 4E, AnimatedContainer accessibility: remove whole-section `inert` from entrance animation; preserve visual animation with opacity/transform only; add regression tests.
- Team 4F, admin drawer modal boundary: ensure public header is not interactive behind admin drawer by hiding header on admin routes or broadening modal inerting with correct z-index/focus behavior.
- Team 4G, admin landmarks/headings: make skip target focusable, normalize admin region labeling, and fix `blog-stats` heading hierarchy.
- Team 4H, icons/source links: add `aria-hidden` to decorative icons and provider-specific accessible names for repeated Source links.
- Team 4I, sparklines/recharts motion: make `Sparkline` and remaining Recharts animations respect reduced motion.
- Team 4J, chart accessibility standardization: enforce all admin/blog charts are wrapped with `ChartInteraction` or have built-in hidden table/summary alternatives.

Exit gate:
- Admin component and lib tests pass.
- Keyboard/drawer tests cover tab trap, Escape, focus restore, and background header exclusion.
- Axe route smoke finds no serious/critical issues on admin routes.

## Wave 5: Simplification and Architecture Cleanup

This wave is behavior-preserving only.

- Team 5A, visitor fallback dedupe: deduplicate empty/error visitor snapshot factories across `app/admin/lib/visitor-analytics.ts` and `app/admin/lib/free-admin-dashboard.ts` without changing outputs.
- Team 5B, blog-stats derivation: continue extracting summary derivation from `app/admin/blog-stats/page.tsx` into `app/admin/blog-stats/summary.ts`; cover year/tag/reading-time/word stats in `summary.test.ts`.
- Team 5C, chart primitive unification: consolidate duplicated chart parsing and presentation helpers between `app/admin/components/Charts.tsx` and `app/admin/blog-stats/Charts.tsx` where behavior is identical.
- Team 5D, ChartInteraction state simplification: replace JS hover state with CSS hover/focus where behavior is purely visual.
- Team 5E, content filters semantics: group filters in a labelled search/filter form if it does not change submit behavior.

Exit gate:
- Tests prove identical output/behavior for simplified modules.
- No semantic-change opportunities are mixed into this wave.

## Wave 6: Test, CI, and Quality Gates

These lanes can run in parallel after source changes stabilize.

- Team 6A, CI subtitle gate: add browser install and `pnpm test:subtitle-geometry` to CI, separate from local `pnpm check` unless local runtime cost is acceptable.
- Team 6B, SEO browser smoke: add `tests/seo-metadata.spec.ts` covering canonical, OG/Twitter, robots, and JSON-LD on representative routes.
- Team 6C, accessibility gate: promote axe coverage for `/`, `/blog`, representative post, `/admin`, `/admin/content`, and `/admin/blog-stats`; fail on serious/critical violations.
- Team 6D, admin Playwright stability: replace serial auth dependency and arbitrary waits in `tests/admin-dashboard.spec.ts` with fixtures/global setup and role/test-id selectors.
- Team 6E, rollup pruning tests: add deterministic tests for `pruneAnalyticsData()` cutoff behavior, running-row preservation, and catch-to-zero behavior.
- Team 6F, schema edge tests: add absolute image URL, fallback image, and JSON-LD escaping tests.
- Team 6G, coverage baseline: add coverage tooling only with dependency approval; start with ratcheting thresholds based on measured baseline.
- Team 6H, Lighthouse budgets: expand `lighthouserc.cjs` routes and run count; add resource/CWV budgets after baseline measurement rather than strict blind thresholds.

Exit gate:
- CI has explicit browser/test strategy.
- SEO, accessibility, subtitle, admin analytics, and performance regressions have automated coverage.

## Wave 7: Measurement and Final Verification

Run after all implementation waves.

- Team 7A, full static validation: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `git diff --check`, `pnpm build`.
- Team 7B, browser validation: `pnpm test:subtitle-geometry`, admin dashboard Playwright, SEO metadata Playwright, accessibility Playwright/axe.
- Team 7C, performance validation: Lighthouse mobile for `/`, `/blog`, representative post, `/admin`, and `/lab/subtitles`; compare against Wave 0 baseline.
- Team 7D, SEO validation: inspect generated `robots.txt`, `sitemap.xml`, page heads, and JSON-LD; run Rich Results validation manually or via documented external check where feasible.
- Team 7E, diff review: run an independent code review on the full final diff.

Exit gate:
- All mandatory commands pass.
- Any external/manual validation gaps are listed with owner and follow-up.
- No `Back to Blog` appears under `app/admin`.

## Recommended Parallel Team Topology

- SEO team: owns `app/robots.ts`, `app/sitemap.ts`, `lib/metadata.ts`, `lib/schema.ts`, `app/blog/**`, metadata tests, and MDX content links.
- Performance team: owns `components/HomePageClient.tsx`, `components/ParticlesBackground.tsx`, `components/particles/**`, `app/page.module.css`, and performance budgets.
- Subtitle team: owns `components/LandingTitle.tsx`, `components/landing-title/**`, `app/lab/subtitles/**`, and `tests/subtitle-*`.
- Admin data team: owns `app/admin/lib/**`, admin API rollup route, and admin data tests.
- Admin frontend/a11y team: owns `app/admin/components/**`, `app/admin/layout.tsx`, admin pages, and admin component tests.
- Test/CI team: owns `.github/workflows/**`, `playwright.config.ts`, `lighthouserc.cjs`, browser tests, and coverage config.
- Simplification team: owns only files explicitly assigned after behavior invariants are written.

## Conflict Rules

- `app/admin/lib/analytics-rollups.ts` must be sequentially owned by Admin data team only.
- `components/HomePageClient.tsx` must be owned by Performance team only during Wave 2.
- `components/landing-title/**` must be owned by Subtitle team only during Wave 3.
- `playwright.config.ts` must be owned by Test/CI team only.
- Any team needing a file owned by another team must file a handoff note and wait for that team’s exit gate.

## Success Criteria

- SEO is technically complete: canonical URLs, crawl controls, sitemap freshness, OG/Twitter cards, JSON-LD, tag URLs, and internal links are coherent and tested.
- Core Web Vitals risk is materially reduced: lighter homepage critical JS, static first paint, reduced particle INP risk, stable routes, and measured Lighthouse/trace improvements.
- Subtitle system is fully verified: every faux professional title maps to the right id/lane/renderer/design and renders correctly across responsive, theme, and reduced-motion states.
- Admin dashboard is trustworthy and accessible: rollups do not preserve stale rows, setup states are accurate, modal/focus semantics are valid, charts have data alternatives, and reduced motion is comprehensive.
- Test and CI gates cover the real risk surfaces: subtitle geometry, SEO rendered heads, accessibility, admin analytics edge cases, coverage baseline, and performance budgets.
- Final validation passes: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:subtitle-geometry`, `pnpm build`, `git diff --check`, and browser/SEO/a11y checks added by the plan.
