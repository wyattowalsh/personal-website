# Admin Dashboard Documentation

> Comprehensive guide for the `/admin` intelligence dashboard.

## Architecture

The admin dashboard is a protected Next.js App Router surface at `/admin`. It uses a modular component architecture with server and client boundaries optimized for data fetching and interactivity.

```
app/admin/
├── page.tsx                 # Main dashboard page (server)
├── layout.tsx               # Admin layout with auth gate
├── error.tsx                # Error boundary
├── loading.tsx              # Suspense fallback
├── components/              # React components
│   ├── OnboardingWalkthrough.tsx   # First-time tour
│   ├── ChangelogTimeline.tsx       # Release history
│   ├── ArchiveManager.tsx          # Stale post management
│   ├── RelatedPostsPanel.tsx       # Tag-similarity panel
│   ├── DataGrid.tsx                # Sortable/searchable table
│   └── ...
├── lib/                     # Business logic
│   ├── archive-mode.ts      # Archive/stale detection
│   ├── related-posts.ts     # Tag-based similarity
│   ├── visitor-analytics.ts # PostHog aggregation
│   ├── analytics-rollups.ts # Turso time-series storage
│   └── ...
└── blog-stats/              # Content health sub-pages
```

### Server vs Client Boundaries

- **Server components** (`page.tsx`, `layout.tsx`) handle auth validation and initial data fetching
- **Client components** (`'use client'`) manage interactivity: tables, charts, tours, and filters
- **Async sections** load expensive data inside `<Suspense>` boundaries to keep Time-to-Interactive low

## Authentication

### Session Management

Admin sessions use signed HttpOnly cookies:

| Property | Value |
| :--- | :--- |
| Cookie name | `admin_session` |
| Signing | HMAC-SHA256 with `SESSION_SIGNING_KEY` |
| Expiry | 24 hours |
| Rate limit | 5 attempts per 15-minute window |
| Secure | `Secure` flag in production; `SameSite=Strict` always |

### Local Development

No password required in development. Navigate to `/admin` and submit an empty password.

### Production

Set these environment variables:

```bash
ADMIN_PASSWORD=<long-random-password>
SESSION_SIGNING_KEY=$(openssl rand -base64 32)
```

Session validation runs on every `/admin` request. Invalid or expired sessions redirect to the login page.

## Analytics Providers

The dashboard aggregates data from multiple free-tier sources:

| Provider | Data | Required Env |
| :--- | :--- | :--- |
| **PostHog** | Visitor counts, pageviews, sessions, events | `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID` |
| **Turso** | Time-series rollup storage and caching | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` |
| **Vercel** | Deployment status and build metrics | `VERCEL_TOKEN`, `VERCEL_PROJECT_ID` |
| **PageSpeed** | Core Web Vitals scores | `PAGESPEED_API_KEY` |
| **Google Search Console** | Search impressions, clicks, CTR | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN` |
| **IndexNow** | URL submission status | `INDEXNOW_KEY` |

Each provider renders a setup state when credentials are missing rather than failing the entire dashboard.

## Database Schema

### Turso Analytics Rollups

Three tables store aggregated visitor data:

| Table | Purpose |
| :--- | :--- |
| `analytics_rollup_days` | Daily aggregates (pageviews, visitors, sessions) |
| `analytics_rollup_runs` | Rollup job metadata (started, completed, status) |
| `analytics_rollup_dimensions` | Dimensional breakdown (page, referrer, device, event) |

### Schema Health

The system detects schema state (`healthy`, `outdated`, `unknown`) and auto-initializes on first deploy. Tables with existing data are never dropped automatically.

## API Routes

| Route | Method | Purpose |
| :--- | :--- | :--- |
| `/api/admin/login` | POST | Authenticate and issue session cookie |
| `/api/admin/logout` | POST | Clear session cookie |
| `/api/admin/telemetry` | GET | Stream server telemetry logs |
| `/api/admin/analytics/refresh` | POST | Trigger analytics rollup refresh |
| `/api/admin/content/health` | GET | Content quality snapshot |

All routes validate sessions and return JSON with consistent error shapes.

## Components

### OnboardingWalkthrough

- Triggered by `?tour=admin` or first visit
- 5-step spotlight tour: Welcome → Overview → Tabs → Export → Settings
- Completion stored in `localStorage`

### ChangelogTimeline

- Displays release history from `content/admin-changelog.md`
- Grouped by version with feature/fix/improvement badges

### ArchiveManager

- Lists stale posts (>6 months without update)
- Suggested actions: Update, Merge, or Redirect
- Supports "Mark Updated" and "Add to Update Queue" actions

### RelatedPostsPanel

- Shows related posts for a selected post
- Uses Jaccard index on tags for similarity scoring
- Displays shared tags and match percentage

## Feature Flags

Features are implicitly gated by environment variable presence:

| Feature | Gate |
| :--- | :--- |
| Visitor analytics | `POSTHOG_PERSONAL_API_KEY` + `POSTHOG_PROJECT_ID` |
| Rollup caching | `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` |
| Growth panel | `GOOGLE_OAUTH_REFRESH_TOKEN` |
| Performance panel | `PAGESPEED_API_KEY` |
| Deployment tracking | `VERCEL_TOKEN` |

## Environment Variables

### Required (site function)

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for meta tags and sitemaps |

### Required for `/admin`

| Variable | Description |
| :--- | :--- |
| `ADMIN_PASSWORD` | Production login password |
| `SESSION_SIGNING_KEY` | HMAC key for cookie signing |

### Required for analytics

| Variable | Description |
| :--- | :--- |
| `TURSO_DATABASE_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `POSTHOG_PERSONAL_API_KEY` | PostHog query API key (`query:read` scope) |
| `POSTHOG_PROJECT_ID` | PostHog project ID |

### Optional

| Variable | Description |
| :--- | :--- |
| `POSTHOG_API_HOST` | Custom PostHog host (defaults to US) |
| `CRON_SECRET` | Secret for securing cron-triggered rollup refresh |
| `ANALYZE` | Set to `true` to enable bundle analyzer |

## Troubleshooting

### Dashboard shows "setup" for all providers

Verify environment variables are set in Vercel and redeploy. Local development works without analytics credentials.

### "Rollup store" badge appears instead of "Live PostHog"

This is expected when Turso has cached data. Live queries are used as fallback when rollups are stale or missing.

### Session expires quickly

The session lasts 24 hours. If `SESSION_SIGNING_KEY` changes, all active sessions become invalid.

### Hydration errors in telemetry

Ensure `TelemetryAutoRefresh` and other client-only components are wrapped in `'use client'` and do not render server-dependent markup.

### Archive Manager shows no posts

Archive and stale detection require posts to be older than 6 months. If your content is newer, no suggestions will appear.
