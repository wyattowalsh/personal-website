'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { setAnalyticsOptOut, getAnalyticsOptOut } from '@/lib/analytics';
import { Switch } from '@/components/ui/switch';

export default function PrivacyPage() {
  const [optedOut, setOptedOut] = useState(false);

  useEffect(() => {
    setOptedOut(getAnalyticsOptOut());
  }, []);

  const handleToggle = () => {
    const newValue = !optedOut;
    setAnalyticsOptOut(newValue);
    setOptedOut(newValue);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className={cn(
        "text-3xl sm:text-4xl font-display font-bold mb-8",
        "bg-clip-text text-transparent bg-gradient-heading"
      )}>
        Privacy Policy
      </h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <p className="text-lg text-muted-foreground">
          This site collects data to understand how content is used, who reads
          it, and to debug technical issues. Here is a transparent accounting of
          what is collected and how you can opt out.
        </p>

        {/* ---- Analytics ---- */}
        <section>
          <h2>Analytics</h2>
          <p>
            This site uses <strong>Vercel Analytics</strong> (cookieless) and a
            custom analytics beacon. Every analytics event is enriched with
            device metadata (see &ldquo;Device Information&rdquo; below).
          </p>
          <p>The following events are tracked:</p>
          <ul>
            <li>
              <strong>Page views</strong> &mdash; URL, referrer, page title,
              UTM parameters
            </li>
            <li>
              <strong>Page exits</strong> &mdash; time spent on the page
            </li>
            <li>
              <strong>Scroll depth</strong> &mdash; how far you scroll at 10%
              intervals
            </li>
            <li>
              <strong>Reading progress</strong> &mdash; 25%, 50%, 75%, 100%
              milestones on blog posts
            </li>
            <li>
              <strong>Time on page</strong> &mdash; active reading time
              milestones (30s, 60s, 3min, 5min)
            </li>
            <li>
              <strong>Search queries</strong> &mdash; what you search for
              (sanitized to 50 characters)
            </li>
            <li>
              <strong>Share clicks</strong> &mdash; which social platform share
              button you click
            </li>
            <li>
              <strong>Outbound link clicks</strong> &mdash; links to external
              sites that you click
            </li>
          </ul>
        </section>

        {/* ---- Device fingerprinting ---- */}
        <section>
          <h2>Device Fingerprinting</h2>
          <p>
            This site generates a <strong>browser fingerprint</strong> using{' '}
            <a
              href="https://github.com/nicyuvi/fingerprintjs"
              target="_blank"
              rel="noopener noreferrer"
            >
              FingerprintJS (open-source)
            </a>
            . The fingerprint is a hash derived from browser characteristics
            including canvas rendering, WebGL, audio context, installed fonts,
            screen properties, and timezone. It does not use cookies but can
            identify the same browser across sessions.
          </p>
          <p>The fingerprint is used to:</p>
          <ul>
            <li>Distinguish new vs returning visitors</li>
            <li>Count unique visitors and visit frequency</li>
            <li>Associate analytics events across page navigations</li>
          </ul>
          <p>
            The fingerprint is stored only as a hash &mdash; it cannot be
            reversed to reveal your identity.
          </p>
        </section>

        {/* ---- Visitor identification ---- */}
        <section>
          <h2>Visitor Identification</h2>
          <p>
            Your browser fingerprint is combined with a{' '}
            <code>localStorage</code> record to track:
          </p>
          <ul>
            <li>When you first visited the site</li>
            <li>How many sessions you have had</li>
            <li>Whether you are a new or returning visitor</li>
          </ul>
          <p>
            A random <strong>session ID</strong> is generated per browser tab
            (stored in <code>sessionStorage</code>) to group events within a
            single visit.
          </p>
        </section>

        {/* ---- Device information ---- */}
        <section>
          <h2>Device Information</h2>
          <p>
            Every analytics event includes device metadata collected from your
            browser:
          </p>
          <ul>
            <li>Screen resolution, viewport size, pixel ratio, color depth</li>
            <li>Browser user agent, platform, language, timezone</li>
            <li>
              Network connection type and speed (if available)
            </li>
            <li>CPU core count and device memory (if available)</li>
            <li>GPU renderer and vendor (via WebGL)</li>
            <li>Touch capability and PDF viewer support</li>
          </ul>
        </section>

        {/* ---- Server-side enrichment ---- */}
        <section>
          <h2>Server-Side Data</h2>
          <p>
            When analytics events reach our server, they are enriched with:
          </p>
          <ul>
            <li>
              <strong>IP address</strong> &mdash; used for geographic
              approximation (country, region, city)
            </li>
            <li>
              <strong>Server timestamp</strong>
            </li>
          </ul>
          <p>
            Geographic data is derived from Vercel&apos;s edge network headers.
            IP addresses are logged with events.
          </p>
        </section>

        {/* ---- Performance ---- */}
        <section>
          <h2>Performance Monitoring</h2>
          <p>
            <strong>Vercel Speed Insights</strong> collects anonymous Core Web
            Vitals (page load times, interactivity, layout stability). No
            cookies or personal data are involved.
          </p>
        </section>

        {/* ---- Error tracking ---- */}
        <section>
          <h2>Error Tracking</h2>
          <p>
            <strong>Sentry</strong> captures JavaScript errors to help fix bugs.
            Error events are sampled (5% of page loads). PII is filtered on the
            client side (query strings, cookies stripped). On the server side,
            identifying headers (IP, User-Agent) are also filtered.
          </p>
          <p>
            <strong>Session replay</strong> is enabled for 10% of error events.
            When an error occurs, Sentry may capture a recording of the page
            state (DOM, scroll position, clicks) leading up to the error. Form
            inputs are masked by default.
          </p>
        </section>

        {/* ---- Comments ---- */}
        <section>
          <h2>Comments</h2>
          <p>
            Blog post comments are powered by{' '}
            <strong>Giscus</strong> (GitHub Discussions). To comment, you
            authenticate with GitHub via OAuth. Your GitHub username and avatar
            are visible. See{' '}
            <a
              href="https://github.com/giscus/giscus/blob/main/PRIVACY-POLICY.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              Giscus privacy policy
            </a>
            .
          </p>
        </section>

        {/* ---- Webmentions ---- */}
        <section>
          <h2>Webmentions</h2>
          <p>
            Public webmentions are fetched from <strong>webmention.io</strong>{' '}
            for each blog post. The page URL is sent as a query parameter. No
            user data is included in this request.
          </p>
        </section>

        {/* ---- Video embeds ---- */}
        <section>
          <h2>Video Embeds</h2>
          <p>
            YouTube videos use <code>youtube-nocookie.com</code> (privacy-enhanced
            mode). Vimeo embeds include <code>dnt=1</code>. Iframes only load
            when you click play.
          </p>
        </section>

        {/* ---- Local storage ---- */}
        <section>
          <h2>Local Storage</h2>
          <p>This site stores the following in your browser:</p>
          <ul>
            <li>
              <strong>Theme preference</strong> (<code>localStorage</code>)
              &mdash; &quot;light&quot;, &quot;dark&quot;, or &quot;system&quot;
            </li>
            <li>
              <strong>Visitor record</strong> (<code>localStorage</code>) &mdash;
              first visit date, visit count, keyed by fingerprint hash
            </li>
            <li>
              <strong>Session ID</strong> (<code>sessionStorage</code>) &mdash;
              random UUID, cleared when you close the tab
            </li>
            <li>
              <strong>Analytics opt-out flag</strong> (<code>localStorage</code>)
              &mdash; if you opt out below
            </li>
            <li>
              <strong>API response caches</strong> (
              <code>sessionStorage</code>) &mdash; webmentions and related posts
            </li>
          </ul>
        </section>

        {/* ---- Cookies ---- */}
        <section>
          <h2>Cookies</h2>
          <p>
            This site does not set cookies for regular visitors. The only cookie
            (<code>admin_session</code>) is used for the password-protected
            admin area.
          </p>
        </section>

        {/* ---- Third-party services ---- */}
        <section>
          <h2>Third-Party Services</h2>
          <p>Data is sent to these services:</p>
          <ul>
            <li>
              <strong>Vercel</strong> &mdash; analytics, speed insights, hosting,
              geo headers
            </li>
            <li>
              <strong>Sentry</strong> &mdash; error tracking, session replay
            </li>
            <li>
              <strong>GitHub / Giscus</strong> &mdash; comments
            </li>
            <li>
              <strong>webmention.io</strong> &mdash; webmention aggregation
            </li>
            <li>
              <strong>YouTube / Vimeo</strong> &mdash; video embeds (on user
              interaction only)
            </li>
          </ul>
        </section>

        {/* ---- Opt out ---- */}
        <section>
          <h2>Opt Out</h2>
          <p>
            You can disable all custom analytics, fingerprinting, and beacon
            tracking on this site. When opted out:
          </p>
          <ul>
            <li>No custom events are sent to Vercel Analytics</li>
            <li>No fingerprint is generated</li>
            <li>No beacon calls are made to our server</li>
            <li>Session tracking, scroll depth, and link click tracking stop</li>
          </ul>
          <p>
            Vercel&apos;s built-in page view counter and Speed Insights will
            still function as they are anonymous and cookieless.
          </p>
          <div className="not-prose flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/30">
            <Switch
              checked={optedOut}
              onCheckedChange={handleToggle}
              aria-label="Opt out of analytics"
            />
            <span className="text-sm font-medium">
              {optedOut
                ? 'All tracking is disabled'
                : 'Tracking is enabled'}
            </span>
          </div>
        </section>

        {/* ---- Contact ---- */}
        <section>
          <h2>Contact</h2>
          <p>
            Questions about this privacy policy? Reach out via{' '}
            <Link href="/" className="text-primary hover:underline">
              the contact links on the homepage
            </Link>
            .
          </p>
        </section>

        <p className="text-sm text-muted-foreground pt-4 border-t border-border/30">
          Last updated: March 2026
        </p>
      </div>
    </div>
  );
}
