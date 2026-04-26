'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { setAnalyticsOptOut, getAnalyticsOptOut } from '@/lib/analytics';
import { Switch } from '@/components/ui/switch';

export default function PrivacyPage() {
  const [optedOut, setOptedOut] = useState(false);

  useEffect(() => {
    setOptedOut(getAnalyticsOptOut()); // eslint-disable-line react-hooks/set-state-in-effect -- sync from localStorage on mount
  }, []);

  const handleToggle = () => {
    const newValue = !optedOut;
    setAnalyticsOptOut(newValue);
    setOptedOut(newValue);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1
        className={cn(
          'text-3xl sm:text-4xl font-display font-bold mb-8',
          'bg-clip-text text-transparent bg-gradient-heading'
        )}
      >
        Privacy Policy
      </h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <p className="text-lg text-muted-foreground">
          This site uses privacy-conscious analytics to understand aggregate
          traffic, content engagement, and technical performance. Analytics are
          anonymous and are not used to identify you by name or email.
        </p>

        <section>
          <h2>Analytics</h2>
          <p>
            This site uses <strong>Vercel Analytics</strong>,{' '}
            <strong>Vercel Speed Insights</strong>, and{' '}
            <strong>PostHog</strong>. The analytics dashboard is used to review
            aggregate visitor behavior such as page views, referrers, device
            category, site searches, reading progress, share clicks, outbound
            clicks, copied code snippets, and theme changes.
          </p>
          <p>
            Search queries are sanitized before they are sent: only the first 50
            characters are kept and special characters are stripped. Do not enter
            personal information into the site search box.
          </p>
        </section>

        <section>
          <h2>Visitor Identification</h2>
          <p>
            The site stores a random anonymous browser ID in{' '}
            <code>localStorage</code> and a random per-tab session ID in{' '}
            <code>sessionStorage</code>. These IDs help count unique anonymous
            visitors and sessions. They are not connected to a name, email
            address, account, or GitHub identity.
          </p>
          <p>
            The site does not intentionally use browser fingerprinting for
            visitor analytics, and PostHog person-profile processing is disabled
            for captured site events.
          </p>
        </section>

        <section>
          <h2>Performance Monitoring</h2>
          <p>
            <strong>Vercel Speed Insights</strong> collects anonymous Core Web
            Vitals such as load time, interactivity, and layout stability.
          </p>
        </section>

        <section>
          <h2>Error Tracking</h2>
          <p>
            <strong>Sentry</strong> captures JavaScript and server errors to
            help fix bugs. Error monitoring is sampled. Session replay is
            disabled for normal sessions and may be captured for error events
            depending on the active Sentry configuration.
          </p>
        </section>

        <section>
          <h2>Comments</h2>
          <p>
            Blog post comments are powered by <strong>Giscus</strong> using
            GitHub Discussions. To comment, you authenticate with GitHub. Your
            GitHub username and avatar are visible in the comment thread. See{' '}
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

        <section>
          <h2>Webmentions</h2>
          <p>
            Public webmentions are fetched from <strong>webmention.io</strong>{' '}
            for each blog post. The page URL is sent as a query parameter. No
            visitor data is included in this request.
          </p>
        </section>

        <section>
          <h2>Video Embeds</h2>
          <p>
            YouTube videos use <code>youtube-nocookie.com</code>{' '}
            privacy-enhanced mode. Vimeo embeds include <code>dnt=1</code>.
            Iframes only load when you click play.
          </p>
        </section>

        <section>
          <h2>Local Storage</h2>
          <p>This site stores the following in your browser:</p>
          <ul>
            <li>
              <strong>Theme preference</strong> (<code>localStorage</code>)
              &mdash; light, dark, or system.
            </li>
            <li>
              <strong>Anonymous analytics ID</strong> (<code>localStorage</code>)
              &mdash; a random ID used for aggregate visitor counts.
            </li>
            <li>
              <strong>Session ID</strong> (<code>sessionStorage</code>) &mdash;
              a random ID cleared when the tab closes.
            </li>
            <li>
              <strong>Analytics opt-out flag</strong> (<code>localStorage</code>)
              &mdash; stores your choice when you opt out below.
            </li>
            <li>
              <strong>API response caches</strong> (<code>sessionStorage</code>)
              &mdash; webmentions and related posts.
            </li>
          </ul>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            This site does not set cookies for regular visitors. The{' '}
            <code>admin_session</code> cookie is used only for the
            password-protected admin area.
          </p>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>Data may be sent to these services:</p>
          <ul>
            <li>
              <strong>Vercel</strong> &mdash; hosting, analytics, and speed
              insights.
            </li>
            <li>
              <strong>PostHog</strong> &mdash; anonymous product and web
              analytics.
            </li>
            <li>
              <strong>Sentry</strong> &mdash; error tracking.
            </li>
            <li>
              <strong>GitHub / Giscus</strong> &mdash; comments.
            </li>
            <li>
              <strong>webmention.io</strong> &mdash; webmention aggregation.
            </li>
            <li>
              <strong>YouTube / Vimeo</strong> &mdash; video embeds on user
              interaction.
            </li>
          </ul>
        </section>

        <section>
          <h2>Opt Out</h2>
          <p>
            You can disable custom analytics events sent by this site. When
            opted out, custom Vercel events and PostHog events stop, and the
            anonymous analytics IDs are no longer used for new events.
          </p>
          <p>
            Vercel&apos;s built-in page view counter and Speed Insights may
            still function because they are provided by the hosting platform.
          </p>
          <div className="not-prose flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
            <Switch
              checked={optedOut}
              onCheckedChange={handleToggle}
              aria-label="Opt out of analytics"
            />
            <span className="text-sm font-medium">
              {optedOut ? 'Custom analytics are disabled' : 'Custom analytics are enabled'}
            </span>
          </div>
        </section>

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

        <p className="border-t border-border/30 pt-4 text-sm text-muted-foreground">
          Last updated: April 2026
        </p>
      </div>
    </div>
  );
}
