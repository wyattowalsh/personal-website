---
title: |
  site
---
<SwmSnippet path="/app/feed.xml/route.ts" line="1">

---

&nbsp;

```typescript
import { NextResponse } from 'next/server';
import { cache } from 'react';
import { Feed } from 'feed';
import { getAllPosts } from '@/lib/posts';
import { getSiteConfig } from '@/lib/config';

// Removed exports of 'dynamic' and 'revalidate'
// export const dynamic = 'force-dynamic';
// export const revalidate = 3600; // Revalidate every hour

// Use cache to precompute the feed
const generateFeed = cache(async () => {
  try {
    const site = await getSiteConfig();
    const posts = await getAllPosts();

    const feed = new Feed({
      title: site.title,
      description: site.description,
      id: site.url,
      link: site.url,
      language: "en",
      favicon: `${site.url}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, ${site.author.name}`,
      author: {
        name: site.author.name,
        email: site.author.email,
        link: site.url,
      },
      feedLinks: {
        rss2: `${site.url}/feed.xml`,
        json: `${site.url}/feed.json`,
        atom: `${site.url}/feed.atom`,
      }
    });

    posts.forEach((post) => {
      feed.addItem({
        title: post.title,
        id: `${site.url}/blog/${post.slug}`,
        link: `${site.url}/blog/${post.slug}`,
        description: post.summary,
        content: post.content,
        author: [site.author],
        date: new Date(post.created),
        image: post.image ? `${site.url}${post.image}` : undefined,
        category: post.tags.map(tag => ({ name: tag })),
      });
    });

    return feed.rss2();
  } catch (error) {
    console.error('Error generating feed:', error);
    return ''; // Return empty string or default feed content
  }
});

export async function GET() {
  const rssFeed = await generateFeed();

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Control caching via headers
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

```

---

</SwmSnippet>

<SwmSnippet path="/app/globals.scss" line="1">

---

&nbsp;

```scss
@use 'sass:math';
@use 'variables.module.scss' as variables;

@use "tailwindcss/base";
@use "tailwindcss/components";
@use "tailwindcss/utilities";

@function random-percentage() {
  @return math.random(100) + 0%;
}

@function random-translate() {
  @return math.random(10) - 5 + px;
}

@layer base {
  :root {
    @include variables.light;
  }

  html.dark {
    @include variables.dark;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  a:not(.no-underline) {
    @apply text-primary underline transition-colors duration-300;
  }

  a.no-underline,
  .no-underline a {
    text-decoration: none;
  }

  a:hover {
    color: var(--primary-foreground);
    text-decoration: underline;
  }

  .prose {
    @apply mx-auto;
    color: var(--foreground);
  }

  code {
    @apply bg-muted text-accent-foreground px-1.5 py-0.5 rounded;
    
    // Add specific styles for inline code
    &:not(pre code) {
      font-family: var(--font-code);
      font-weight: 500;
      font-size: 0.9em;
      letter-spacing: -0.025em;
      vertical-align: baseline;
      position: relative;
      white-space: pre;
      box-decoration-break: clone;
    }
  }

  pre {
    @apply bg-card text-card-foreground p-4 rounded-lg overflow-x-auto;
  }

  .math-container {
    @apply relative my-4 mx-16;
    
    .katex-display {
      @apply overflow-x-auto overflow-y-visible;
      
      &::-webkit-scrollbar {
        @apply h-1.5;
      }
      
      &::-webkit-scrollbar-track {
        @apply bg-transparent;
      }
      
      &::-webkit-scrollbar-thumb {
        @apply bg-slate-400/20 hover:bg-slate-400/30 rounded-full transition-colors duration-300;
      }
    }

    .katex {
      @apply overflow-visible;
    }

    &:hover {
      .katex-display::-webkit-scrollbar-thumb {
        @apply bg-primary opacity-20 hover:opacity-30;
      }
    }
  }

  .math-inline {
    @apply inline-flex items-center rounded border border-opacity-30 border-border bg-muted bg-opacity-30 px-2 py-1 dark:bg-opacity-10 dark:bg-muted;
  }

  .math {
    font-family: 'KaTeX_Main', serif;
    color: var(--math-text-color);
  }

  .math-inline {
    display: inline-block;
    background-color: var(--math-inline-bg);
    padding: 0.1em 0.2em;
    border-radius: 4px;
  }

  .math-display {
    display: block;
    background-color: var(--math-display-bg);
    padding: 0.5em;
    margin: 1em 0;
    border-radius: 8px;
    text-align: center;
    position: relative;
  }

  .equation-number {
    position: absolute;
    right: 0.5em;
    bottom: 0.5em;
    font-size: 0.85em;
    color: var(--math-index-color);
  }

  // Add styles for anchor links on headings
  h1, h2, h3, h4, h5, h6 {
    scroll-margin-top: 100px;
    position: relative;
    
    .anchor-link {
      @apply opacity-0 absolute;
      left: -1.5em;
      padding-right: 0.5em;
      cursor: pointer;
      
      &:hover {
        @apply opacity-100;
      }
      
      .anchor-icon {
        @apply inline-block align-middle;
        width: 1em;
        height: 1em;
      }
    }
    
    &:hover .anchor-link {
      @apply opacity-100;
    }
  }

  // Enhanced equation styles
  .math-display {
    .equation-number-container {
      @apply absolute right-4 bottom-4;
      @apply flex items-center gap-2;
      @apply opacity-0 hover:opacity-100;
      @apply transition-opacity duration-200;
    }

    .equation-number {
      @apply text-math-display-number text-sm;
      @apply transition-all duration-300;
      @apply hover:text-math-display-number-hover;
      @apply cursor-pointer;
      @apply select-none;
      @apply flex items-center gap-1;
      
      &:hover {
        @apply scale-105;
      }
    }

    &:target {
      @apply ring-2 ring-primary/50;
      @apply bg-primary/5;
      animation: highlight 2s ease-out;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    @apply scroll-mt-20 relative;

    .anchor {
      @apply absolute opacity-0 -left-5 top-1/2 -translate-y-1/2;
      @apply transition-all duration-200 ease-out;
      @apply p-1 rounded-md;
      @apply hover:bg-primary/5;
      
      .anchor-icon {
        @apply block w-4 h-4;
        @apply text-muted-foreground;
        @apply transition-all duration-200;
        @apply transform scale-90;
        
        &:hover {
          @apply text-primary scale-100;
        }
      }
    }

    &:hover .anchor {
      @apply opacity-100;
    }
  }

  // Enhanced header styles with autolink
  h1, h2, h3, h4, h5, h6 {
    @apply scroll-mt-20 relative;
    
    // Anchor link container
    .anchor {
      @apply absolute -left-8 top-1/2 -translate-y-1/2;
      @apply opacity-0 invisible;
      @apply p-2 -m-2; // Larger touch target
      @apply rounded-lg;
      @apply transition-all duration-300 ease-out;
      @apply hover:bg-primary/5 dark:hover:bg-primary/10;
      @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50;
      @apply sm:visible; // Only show on larger screens
      
      // Responsive positioning
      @apply md:-left-10;
      @apply lg:-left-12;
      
      // Icon styling
      .anchor-icon {
        @apply block;
        @apply text-muted-foreground opacity-50;
        @apply dark:text-muted-foreground dark:opacity-40;
        @apply transition-all duration-300;
        @apply transform scale-75;
        @apply hover:scale-100 hover:text-primary hover:opacity-100;
        @apply dark:hover:text-primary dark:hover:opacity-100;
        
        // Responsive icon sizing
        @apply w-4 h-4;
        @apply sm:w-5 sm:h-5;
        @apply md:w-6 md:h-6;
        
        // Add subtle glow on hover
        @apply hover:drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)];
        @apply dark:hover:drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)];
      }
    }

    // Show anchor on header hover
    &:hover .anchor {
      @apply opacity-100;
      @apply visible;
      @apply translate-x-0;
    }

    // Mobile-friendly touch target
    @media (hover: none) {
      .anchor {
        @apply opacity-50 visible;
        @apply -left-6 sm:-left-8;
        
        .anchor-icon {
          @apply scale-90;
        }
      }
    }

    // Active state styles
    .anchor:active {
      @apply scale-95;
      @apply bg-primary/10 dark:bg-primary/15;
    }

    // When header is targeted by URL hash
    &:target {
      @apply relative;
      
      &::before {
        content: "";
        @apply absolute -inset-x-4 -inset-y-2;
        @apply bg-primary/5 dark:bg-primary/10;
        @apply rounded-lg;
        @apply animate-[highlight_2s_ease-out];
      }
      
      .anchor {
        @apply opacity-100 visible;
      }
    }
  }

  // Default text selection
  ::selection {
    @apply bg-selection-bg text-selection-text;
  }

  // Heading-specific text selection
  h1, h2, h3, h4, h5, h6 {
    &::selection {
      @apply bg-selection-heading-bg text-selection-heading-text;
    }

    // Also style selection within headings (e.g., for nested elements)
    & *::selection {
      @apply bg-selection-heading-bg text-selection-heading-text;
    }
  }

  // Enhanced responsive heading styles
  h1 {
    @apply text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl;
    @apply leading-tight sm:leading-tight md:leading-tight lg:leading-tight xl:leading-tight;
    @apply tracking-tight sm:tracking-tight md:tracking-tight;
    @apply mb-4 sm:mb-6 md:mb-8;
  }

  h2 {
    @apply text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl;
    @apply leading-tight sm:leading-tight md:leading-tight;
    @apply tracking-tight;
    @apply mt-8 sm:mt-10 md:mt-12 mb-4 sm:mb-6;
  }

  h3 {
    @apply text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl;
    @apply leading-snug sm:leading-snug md:leading-snug;
    @apply mt-6 sm:mt-8 md:mt-10 mb-3 sm:mb-4;
  }

  h4 {
    @apply text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl;
    @apply leading-snug;
    @apply mt-4 sm:mt-6 md:mt-8 mb-2 sm:mb-3;
  }

  // Enhanced heading hover and focus states
  h1, h2, h3, h4, h5, h6 {
    @apply relative overflow-visible;
    
    // Progressive reveal effect on hover
    &::after {
      @apply content-[''] absolute bottom-0 left-0 w-full;
      @apply h-[2px] bg-primary/30 dark:bg-primary/20;
      @apply transform scale-x-0 origin-left;
      @apply transition-transform duration-300 ease-out;
    }

    &:hover::after {
      @apply scale-x-100;
    }

    // Enhanced focus styles
    &:focus-visible {
      @apply outline-none ring-2 ring-primary/50 dark:ring-primary/40;
      @apply rounded-lg;
    }

    // Improved anchor link visibility
    .anchor {
      @apply opacity-0 transform -translate-x-2;
      @apply transition-all duration-300 ease-out;

      @screen md {
        @apply opacity-0 -translate-x-4;
      }

      @screen lg {
        @apply opacity-0 -translate-x-6;
      }
    }

    &:hover .anchor {
      @apply opacity-100 translate-x-0;
    }
  }

  // Enhanced mobile experience
  @media (hover: none) {
    h1, h2, h3, h4, h5, h6 {
      .anchor {
        @apply opacity-50 translate-x-0;
      }
    }
  }
}

// Remove or adjust styles that may interfere with 'strong' and 'em'
// For example, if you have:
// strong, em {
//   // Custom styles that affect nesting
// }

// Modify or remove these styles to prevent conflicts

@keyframes glitch-anim {
  $steps: 20;
  @for $i from 0 through $steps {
    #{math.percentage(math.div($i, 2 * $steps))} {
      clip-path: inset(random-percentage() 0 random-percentage() 0);
      transform: translate(random-translate(), random-translate());
    }
  }
}

@layer components {
  .cyber-grid {
    background-image: 
      linear-gradient(var(--cyber-grid-color) 1px, transparent 1px),
      linear-gradient(90deg, var(--cyber-grid-color) 1px, transparent 1px);
    background-size: var(--cyber-grid-size) var(--cyber-grid-size);
    width: 100%;
    height: 100%;
    transform-origin: center;
    animation: grid-flow 20s linear infinite;
  }

  .glitch-scanlines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0%,
      var(--scan-line-color) 0.5%,
      transparent 1%
    );
    animation: scanlines 10s linear infinite;
  }

  .noise-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org-2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: var(--noise-intensity);
    mix-blend-mode: overlay;
    pointer-events: none;
  }

  .glitch-text {
    position: relative;
    animation: glitch-text 3s infinite;
    
    &::before,
    &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    &::before {
      left: 2px;
      text-shadow: -2px 0 var(--glitch-color-1);
      clip: rect(24px, 550px, 90px, 0);
      animation: glitch-anim 3s infinite linear alternate-reverse;
    }
    
    &::after {
      left: -2px;
      text-shadow: -2px 0 var(--glitch-color-2);
      clip: rect(85px, 550px, 140px, 0);
      animation: glitch-anim 2s infinite linear alternate-reverse;
    }
  }

  .math-display {
    @apply relative my-8 px-8 py-6;
    @apply rounded-xl border border-math-border;
    @apply bg-math-bg/95 dark:bg-math-bg/80;
    @apply shadow-math hover:shadow-math-hover;
    @apply transition-all duration-300;
    @apply hover:border-primary/30;

    .math-content {
      @apply overflow-x-auto overflow-y-hidden;
      @apply scrollbar-thin;
      @apply scrollbar-track-transparent;
      @apply scrollbar-thumb-rounded;
      
      &::-webkit-scrollbar-thumb {
        @apply bg-math-controls-text/20 hover:bg-math-controls-text/30;
      }
    }

    .math-link-button {
      @apply absolute right-2 top-2;
      @apply p-2 rounded-full;
      @apply opacity-0 hover:opacity-100;
      @apply transition-opacity duration-200;
      @apply hover:bg-math-controls-bg;
      @apply text-math-controls-text;
      @apply hover:text-math-controls-text-hover;
    }

    // Style for equation numbers
    .katex {
      text-align: center;
      
      .tag {
        @apply text-math-controls-text;
        @apply transition-colors duration-300;
        position: absolute;
        right: -1em;  // Adjust this value as needed
      }

      // Add clickable behavior to equation numbers
      .tag:hover {
        @apply text-math-controls-text-hover;
        cursor: pointer;
      }

      // Ensure equation content doesn't overlap with tag
      .katex-html {
        position: relative;
      }
    }

    .equation-number {
      @apply absolute right-2 bottom-2 text-math-display-number;
      transition: color 0.3s ease;
    }

    .equation-number:hover {
      @apply text-math-display-number-hover;
      cursor: pointer;
    }

    .equation-number-container {
      @apply absolute right-4 bottom-4;
      @apply flex items-center gap-2;
    }

    .equation-number {
      @apply text-math-display-number text-sm;
      @apply transition-all duration-300;
      @apply hover:text-math-display-number-hover;
      @apply cursor-pointer;
      @apply select-none;
      @apply flex items-center gap-1;
      
      &:hover {
        @apply scale-105;
      }

      &::before {
        content: "";
        @apply absolute -inset-2;
      }
    }

    // Highlight the equation when targeted by URL hash
    &:target {
      @apply ring-2 ring-primary/50;
      @apply bg-primary/5;
    }

    // Add anchor link styles
    &.anchor-equation {
      @apply cursor-pointer;
      
      .anchor-icon {
        @apply absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full;
        @apply opacity-0 transition-opacity duration-200;
        @apply text-math-controls-text w-4 h-4 mx-2;
      }
  
      &:hover {
        .anchor-icon {
          @apply opacity-100;
        }
      }
    }

    &.anchor-equation {
      @apply relative;
      
      .anchor-link {
        @apply absolute -left-6 top-1/2;
        @apply -translate-y-1/2;
        @apply opacity-0;
        @apply text-math-controls-text;
        @apply transition-all duration-200;
        @apply cursor-pointer;
        @apply p-1;
        @apply rounded-md;
        @apply hover:bg-math-controls-bg;
        @apply hover:text-math-controls-text-hover;
  
        &:focus-visible {
          @apply opacity-100 outline-none ring-2 ring-primary;
        }
      }
  
      &:hover {
        .anchor-link {
          @apply opacity-100;
        }
      }
    }

    .equation-link {
      @apply absolute -left-5 top-1/2 -translate-y-1/2;
      @apply opacity-0 transition-all duration-200;
      @apply text-muted-foreground hover:text-primary;
      @apply p-1 rounded-md hover:bg-primary/5;
      @apply scale-90 hover:scale-100;
      @apply hover:opacity-100;
    }

    .equation-number {
      @apply absolute right-4 bottom-4;
      @apply text-sm text-muted-foreground;
      @apply transition-all duration-200;
      @apply opacity-60 hover:opacity-100;
      @apply select-none cursor-pointer;
      @apply hover:text-primary;
    }

    &:target {
      @apply ring-2 ring-primary/20;
      @apply bg-primary/5;
      animation: equation-highlight 1.5s ease-out;
    }
  }

  .math-inline {
    @apply relative inline-flex items-center;
    @apply px-2 py-0.5 rounded-md;
    @apply bg-math-bg/40 dark:bg-math-bg/20;
    @apply border border-math-border/30;
    @apply transition-all duration-300;
    @apply hover:bg-math-bg/60 dark:hover:bg-math-bg/40;
    @apply hover:border-math-border/50;
    @apply hover:shadow-sm dark:hover:shadow-primary/5;
  }

  .subtitle-container {
    perspective: 1000px;
    
    .subtitle-text {
      backface-visibility: hidden;
      transform-style: preserve-3d;
      background: linear-gradient(
        45deg,
        var(--subtitle-gradient-start),
        var(--subtitle-gradient-end)
      );
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      
      animation: subtitle-gradient 8s linear infinite;
      background-size: 200% 200%;
    }
  }
}

@layer utilities {
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r;
    &.primary {
      @apply from-blue-500 via-blue-600 to-blue-700
             dark:from-blue-400 dark:via-blue-500 dark:to-blue-600;
    }
    &.accent {
      @apply from-pink-500 via-purple-500 to-indigo-500
             dark:from-pink-400 dark:via-purple-400 dark:to-indigo-400;
    }
  }

  .hover-lift {
    @apply transition-transform duration-300 ease-out;
    &:hover {
      @apply -translate-y-1;
    }
  }

  .glow {
    @apply relative;
    &::after {
      @apply content-[''] absolute inset-0 z-[-1];
      @apply bg-gradient-glow;
      @apply blur-xl opacity-0 transition-opacity duration-300;
    }
    &:hover::after {
      @apply opacity-100;
    }
  }

  .prose {
    @apply max-w-none;
    @apply sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%] xl:max-w-[80%] 2xl:max-w-[75%];
    @apply mx-auto;
  }

  // Enhance text readability on different screen sizes
  .text-adaptive {
    @apply text-sm sm:text-base md:text-lg lg:text-xl;
    @apply leading-relaxed sm:leading-relaxed md:leading-relaxed;
    @apply tracking-wide sm:tracking-normal md:tracking-normal;
  }
}

@keyframes grid-flow {
  0% {
    transform: perspective(500px) rotateX(60deg) translateY(0);
  }
  100% {
    transform: perspective(500px) rotateX(60deg) translateY(var(--cyber-grid-size));
  }
}

@keyframes scanlines {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100%);
  }
}

@keyframes subtitle-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes highlight {
  0% {
    background-color: var(--primary-20);
  }
  100% {
    background-color: transparent;
  }
}

@keyframes equation-highlight {
  0% { @apply bg-primary/20; }
  100% { @apply bg-primary/5; }
}

@keyframes highlight {
  from {
    @apply bg-primary/20 dark:bg-primary/25;
  }
  to {
    @apply bg-primary/5 dark:bg-primary/10;
  }
}


```

---

</SwmSnippet>

<SwmSnippet path="/app/layout.tsx" line="1">

---

&nbsp;

```tsx
import { Metadata, Viewport } from "next";
import { Fira_Code, Montserrat } from "next/font/google";
import "./globals.scss";
import "katex/dist/katex.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScrollIndicator from "@/components/ScrollIndicator";
import Header from "@/components/Header";
import KaTeXLoader from "@/components/KaTeXLoader";
import CustomScrollbars from "@/components/Scroll";
import { StrictMode } from 'react';
import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google';
import { cn } from "@/lib/utils";
import { getDefaultMetadata } from '@/lib/metadata';
import { generateWebSiteSchema } from '@/lib/schema';

config.autoAddCss = false;

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  preload: true,
  fallback: ['system-ui', 'arial']
});

// Base metadata configuration
export const metadata: Metadata = {
  ...getDefaultMetadata(),
  other: {
    ...getDefaultMetadata().other,
    "google-site-verification": process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  // JSON-LD schema
  alternates: {
    types: {
      'application/ld+json': `${generateWebSiteSchema()}`,
    },
  },
};

// Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StrictMode>
      <html lang="en" suppressHydrationWarning className="antialiased">
        <body
          className={cn(
            "min-h-screen bg-background font-sans",
            "motion-safe:transition-colors motion-safe:duration-300",
            "selection:bg-primary/20 selection:text-primary",
            "scrollbar-thin scrollbar-track-transparent",
            "scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20",
            montserrat.variable,
            firaCode.variable
          )}
          suppressHydrationWarning
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <CustomScrollbars>{children}</CustomScrollbars>
              </main>
            </div>
          </ThemeProvider>
          <ScrollIndicator />
          <KaTeXLoader />
          <GoogleTagManager gtmId="GTM-P7VFKNK6" />
          <GoogleAnalytics gaId="G-17PRGFZN0C" />
        </body>
      </html>
    </StrictMode>
  );
}
```

---

</SwmSnippet>

<SwmSnippet path="/app/not-found.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import { useEffect, useState, useRef } from "react";
import NotFoundContent from "@/components/NotFoundContent";
import { cn } from "@/lib/utils";
import ParticlesBackground from "@/components/ParticlesBackground";

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / 25;
      const y = (e.clientY - rect.top - rect.height / 2) / 25;

      setMousePosition({ x, y });
    };

    const handleLoaded = () => {
      setIsLoaded(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("load", handleLoaded);
    // Trigger animation after a short delay
    const timer = setTimeout(() => setIsLoaded(true), 100);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("load", handleLoaded);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative min-h-[100vh] w-full",
        "flex items-center justify-center",
        "bg-background overflow-hidden",
        "transition-all duration-500 ease-out",
        isLoaded ? "opacity-100" : "opacity-0"
      )}
    >
      <ParticlesBackground />
      {/* Animated background grid with perspective effect */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{
          transform: isLoaded 
            ? `perspective(1000px) rotateX(${mousePosition.y * 0.2}deg) rotateY(${mousePosition.x * 0.2}deg)`
            : 'none',
          transition: 'transform 0.3s ease-out',
        }}
      >
        <div className={cn(
          "cyber-grid",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-b before:from-background before:to-transparent",
          "before:opacity-50"
        )} />
        <div className="glitch-scanlines" />
      </div>

      {/* Enhanced noise overlay with gradient */}
      <div className={cn(
        "noise-overlay",
        "mix-blend-overlay",
        "after:absolute after:inset-0",
        "after:bg-gradient-to-t after:from-background/80 after:to-transparent"
      )} />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-1 h-1 rounded-full",
              "bg-primary/30",
              "animate-float",
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Content wrapper with enhanced parallax */}
      <div 
        className={cn(
          "relative z-10",
          "transition-all duration-500",
          "transform-gpu",
          isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}
        style={{
          transform: isLoaded 
            ? `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px, 0)`
            : 'none'
        }}
      >
        {/* Glowing background effect */}
        <div className={cn(
          "absolute inset-0",
          "bg-gradient-to-r from-primary/20 to-secondary/20",
          "blur-3xl opacity-50",
          "animate-pulse",
          "-z-10"
        )} />
        
        <NotFoundContent />
      </div>
    </div>
  );
}

```

---

</SwmSnippet>

<SwmSnippet path="/app/page.module.scss" line="1">

---

&nbsp;

```scss
@use "variables.module.scss" as variables;

@keyframes backgroundAnimation {
  0%,
  100% { 
    background-position: 0% 50%;
    will-change: background-position;
  }

  50% { 
    background-position: 100% 50%;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
    transform: translateY(-50%) scale(1);
  }

  50% {
    opacity: 1;
    transform: translateY(-50%) scale(1.5);
  }
}

@keyframes patternMove {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 1000px 1000px;
  }
}

.enhanced-title-landing {
  font-size: 3.5rem;
  font-weight: 700;
  background: var(--gradient-text);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleGradient 5s ease infinite;
  text-transform: none;
  position: relative;
  font-family: var(--font-enhanced-title);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  @apply text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold;
  letter-spacing: -0.02em;

  @screen sm {
    letter-spacing: -0.03em;
  }

  @screen lg {
    letter-spacing: -0.04em;
  }
}

@keyframes titleGradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.enhanced-separator {
  position: relative;
  width: 75%;
  max-width: 28rem;
  height: 2px;
  margin: 2rem auto;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--primary) 50%,
    transparent 100%
  );
  opacity: 0.7;
  transition: all 0.3s ease;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--primary);
    transform: translateY(-50%);
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    box-shadow: 0 0 15px var(--primary);
  }

  &::before {
    left: 0;
    animation-delay: 0s;
  }

  &::after {
    right: 0;
    animation-delay: 1s;
  }

  &:hover {
    opacity: 1;
    transform: scaleX(1.05);
    filter: brightness(1.2);
    box-shadow: 0 0 20px var(--primary);

    &::before,
    &::after {
      animation-duration: 1.5s;
    }
  }
}

.enhanced-animated-text {
  background: var(--gradient-text);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientBackground 8s ease infinite;
  position: relative;
  
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  will-change: background-position, transform;
}

.enhanced-animated-text:hover {
  animation-play-state: paused;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
}

@keyframes gradientBackground {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

html.dark .enhanced-animated-text {
  background: var(--gradient-text);
}

@media (max-width: 1024px) {
  .logo-image {
    max-width: 192px;
  }
}

.image-container {
  position: relative;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 9999px;
    background: linear-gradient(
      45deg,
      var(--primary) 0%,
      var(--accent) 50%,
      var(--primary) 100%
    );
    opacity: 0.5;
    z-index: -1;
    transition: all 0.3s ease;
    animation: rotate 10s linear infinite;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    background: radial-gradient(
      circle at center,
      var(--primary) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    filter: blur(15px);
  }

  &:hover {
    transform: scale(1.02);

    &::before {
      opacity: 0.8;
      filter: blur(3px);
    }

    &::after {
      opacity: 0.4;
    }

    img {
      transform: scale(1.05);
      filter: brightness(1.1);
    }
  }
}

@media (prefers-reduced-motion: no-preference) {
  .image-container {
    animation: float 6s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Add new glass-morphism utility
.glass-panel {
  @apply backdrop-blur-md bg-white/10 dark:bg-black/10;
  @apply border border-white/20 dark:border-white/10;
  @apply shadow-xl;
}

// Add animated background patterns
.bg-grid-pattern {
  background-image: linear-gradient(
    var(--primary)/10% 1px,
    transparent 1px
  ),
  linear-gradient(
    90deg,
    var(--primary)/10% 1px,
    transparent 1px
  );
  background-size: 20px 20px;
}

.bg-noise-pattern {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.5;
}

.mainContainer {
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, transparent 0%, rgba(var(--primary-rgb), 0.03) 100%);
    pointer-events: none;
  }
}

.progressBar {
  @apply fixed top-0 left-0 right-0 h-1.5 z-50;
  background: linear-gradient(
    90deg,
    var(--primary) 0%,
    rgba(var(--primary-rgb), 0.8) 50%,
    var(--primary) 100%
  );
  transform-origin: left;
  box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.3);
}

.imageContainer {
  width: 100%;
  max-width: 256px;
  margin: 0 auto;
  perspective: 1000px;
  
  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 9999px;
    background: linear-gradient(
      45deg,
      var(--primary) 0%,
      transparent 50%,
      var(--primary) 100%
    );
    opacity: 0.5;
    z-index: -1;
    transition: all 0.5s ease;
    animation: rotate 10s linear infinite;
  }

  .imageGlow {
    position: absolute;
    inset: -20px;
    background: radial-gradient(
      circle at center,
      rgba(var(--primary-rgb), 0.2) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.5s ease;
    filter: blur(15px);
    z-index: -1;
  }

  &:hover {
    .imageGlow {
      opacity: 1;
    }

    &::before {
      opacity: 0.8;
      filter: blur(3px);
    }
  }
}

.profileImage {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  filter: brightness(1) contrast(1);
  transform-style: preserve-3d;
  
  &:hover {
    filter: brightness(1.1) contrast(1.1);
    transform: scale(1.02) translateZ(20px);
  }
}

.enhancedSeparator {
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(var(--primary-rgb), 0.4),
      transparent
    );
    animation: shimmer 3s infinite;
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

---

</SwmSnippet>

<SwmSnippet path="/app/page.tsx" line="1">

---

&nbsp;

```tsx
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Links from "@/components/Links";
import { Separator } from "@/components/ui/separator";
import LandingTitle from "@/components/LandingTitle";
import ParticlesBackground from "@/components/ParticlesBackground";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import styles from "./page.module.scss";

export default function HomePage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.4]);
  const imageRotate = useTransform(scrollYProgress, [0, 0.5], [0, -5]);

  // Enhanced animations
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
        staggerChildren: 0.2
      }
    }
  };

  const imageContainerVariants = {
    hidden: { scale: 0.8, opacity: 0, rotate: -10 },
    visible: { 
      scale: 1, 
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        duration: 1,
        bounce: 0.4
      }
    },
    hover: { 
      scale: 1.05,
      rotate: 5,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className={cn(
        "relative min-h-screen overflow-hidden",
        "bg-gradient-to-b from-background via-background/95 to-background/90",
        "dark:from-background dark:via-background/95 dark:to-background/90",
        styles.mainContainer
      )}
    >
      <ParticlesBackground />
      
      <motion.div
        className={styles.progressBar}
        style={{ scaleX }}
      />

      <motion.div
        ref={ref}
        className={cn(
          "relative z-10 flex flex-col min-h-screen",
          "px-4 sm:px-6 lg:px-8",
          "py-12 sm:py-16 lg:py-20",
          "max-w-7xl mx-auto w-full",
          "backdrop-blur-sm"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            className="flex flex-col items-center justify-center space-y-12"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
          >
            <motion.div 
              className={cn(styles.imageContainer, "relative group")}
              variants={imageContainerVariants}
              whileHover="hover"
              style={{
                scale: imageScale,
                opacity: imageOpacity,
                rotate: imageRotate
              }}
            >
              <div className={styles.imageGlow} />
              <Image
                className={cn(
                  "rounded-full shadow-2xl transition-all duration-300",
                  "border-4 border-white/90 dark:border-gray-800/90",
                  styles.profileImage
                )}
                src="/logo.webp"
                alt="Logo — Wyatt Walsh"
                width={256}
                height={256}
                priority
                quality={100}
              />
            </motion.div>

            <LandingTitle />
            
            <motion.div
              className="w-full max-w-2xl"
              variants={{
                hidden: { opacity: 0, scaleX: 0 },
                visible: { 
                  opacity: 1, 
                  scaleX: 1,
                  transition: { duration: 0.8, ease: "easeInOut" }
                }
              }}
            >
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.5, delay: 0.4 }
                }
              }}
            >
              <Links />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.main>
  );
}

```

---

</SwmSnippet>

<SwmSnippet path="/app/variables.module.scss" line="1">

---

&nbsp;

```scss
// variables.module.scss

// Base Colors
$color-hue: 198;
$color-saturation: 33.6%;
$color-lightness: 56.3%;
$foreground-lightness-light: 0%;
$foreground-lightness-dark: 90%;
$background-lightness-light: 95%;
$background-lightness-dark: 5%;

// Shadows
$shadow-glow: 0 0 15px rgba(59, 130, 246, 0.5);
$shadow-soft-light: 0 10px 25px rgba(0, 0, 0, 0.1);
$shadow-soft-dark: 0 10px 25px rgba(0, 0, 0, 0.5);

// Fonts
$font-sans: 'Montserrat',
sans-serif;
$font-display: 'Oswald',
sans-serif;
$font-code: 'Fira Code',
monospace;

// Gradients
$gradient-background-light: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
$gradient-background-dark: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$gradient-text-light: linear-gradient(90deg, #1a56db 0%, #7c3aed 100%);
$gradient-text-dark: linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%);
$gradient-border-light: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
$gradient-border-dark: linear-gradient(90deg, #667eea 0%, #764ba2 100%);

// Math controls
$math-controls-text: hsl(215, 20.2%, 65.1%);
$math-controls-text-hover: hsl(222.2, 47.4%, 11.2%);
$math-controls-bg: hsla(210, 40%, 98%, 0.9);
$math-controls-hover: hsla(210, 40%, 95%, 1);

// Ensure math controls variables are properly set
$math-controls-bg: hsla(210, 40%, 98%, 0.95);
$math-controls-text: hsl(215.4, 16.3%, 46.9%);

// New Math component variables
$math-text-color: hsl(222, 47%, 11%); // Slate-900
$math-index-color: hsl(215, 20%, 65%); // Slate-500
$math-inline-bg: hsla(210, 40%, 98%, 0.9);
$math-display-bg: hsla(210, 40%, 98%, 0.95);
$math-display-number: hsl(215, 20%, 65%); // Slate-500
$math-display-number-hover: hsl(222.2, 47.4%, 11.2%); // Slate-900

// Light Mode Variables
@use 'sass:map';

// Light Mode Math Colors
$light-math-colors: (
  'math-bg': '245 247 250',  // RGB format
  'math-bg-transparent': '245 247 250',
  'math-border': 'hsla(214.3, 31.8%, 91.4%, 0.6)',
  'math-controls-text': '100 116 139', // slate-500
  'math-controls-text-hover': '15 23 42', // slate-900
);

// Dark Mode Math Colors
$dark-math-colors: (
  'math-bg': '17 19 23',  // RGB format
  'math-bg-transparent': '17 19 23',
  'math-border': 'hsla(217.2, 32.6%, 17.5%, 0.6)',
  'math-controls-text': '148 163 184', // slate-400
  'math-controls-text-hover': '241 245 249', // slate-100
);

$light-math-colors: (
  'math-bg': '245 247 250',  // RGB values without rgb() wrapper
  'math-bg-transparent': '245 247 250',
  'math-border': 'hsla(214.3, 31.8%, 91.4%, 0.6)',
  'math-shadow': '0 4px 16px rgba(0, 0, 0, 0.06)',
  'math-hover-shadow': '0 8px 30px rgba(59, 130, 246, 0.15)',
  'math-equation-bg': hsla(210, 40%, 98%, 0.9),
  'math-controls-bg': 'hsla(210, 40%, 98%, 0.95)',
  'math-controls-hover': 'hsla(210, 40%, 95%, 1)',
  'math-controls-text': '100 116 139', // RGB values for slate-500
  'math-controls-text-hover': '15 23 42', // RGB values for slate-900
);

// Dark Mode Variables
$dark-math-colors: (
  'math-bg': '17 19 23',  // RGB values without rgb() wrapper
  'math-bg-transparent': '17 19 23',
  'math-border': 'hsla(217.2, 32.6%, 17.5%, 0.6)',
  'math-shadow': '0 4px 16px rgba(0, 0, 0, 0.3)',
  'math-hover-shadow': '0 8px 30px rgba(59, 130, 246, 0.25)',
  'math-equation-bg': hsla(222.2, 84%, 4.9%, 0.8),
  'math-controls-bg': 'hsla(222.2, 84%, 4.9%, 0.9)',
  'math-controls-hover': 'hsla(222.2, 84%, 4.9%, 1)',
  'math-controls-text': '148 163 184', // RGB values for slate-400
  'math-controls-text-hover': '241 245 249', // RGB values for slate-100
);

// Add new enhanced gradient variables
$enhanced-gradients: (
  'primary': (
    'light': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
    'dark': 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 50%, #3b82f6 100%)'
  ),
  'accent': (
    'light': 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)',
    'dark': 'linear-gradient(135deg, #f9a8d4 0%, #f472b6 50%, #ec4899 100%)'
  )
);

// Add new animation timing variables
$animation-timing: (
  'fast': 200ms,
  'normal': 300ms,
  'slow': 500ms,
  'very-slow': 1000ms
);

// Light Theme Variables
@mixin light {
  --primary-rgb: 59, 130, 246; // Add this if not present
  --primary: rgb(var(--primary-rgb));
  --background: hsl(198 100% 95%);
  --foreground: hsl(198 5% 0%);
  --primary: hsl(198 33.6% 56.3%);
  --primary-foreground: hsl(0, 0%, 100%);
  --secondary: hsl(198 30% 70%);
  --secondary-foreground: hsl(0, 0%, 0%);
  --accent: hsl(160, 30%, 80%);
  --accent-foreground: hsl(#{$color-hue}, 5%, 10%);
  --destructive: hsl(0, 100%, 30%);
  --destructive-foreground: hsl(#{$color-hue}, 5%, 90%);
  --border: hsl(198 30% 50%);
  --input: hsl(198 30% 18%);
  --ring: hsl(198 33.6% 56.3%);
  --radius: 0.5rem;

  --card: hsl(198 50% 90%);
  --card-foreground: hsl(198 5% 10%);
  --popover: hsl(#{$color-hue}, 100%, 95%);
  --popover-foreground: hsl(#{$color-hue}, 100%, 0%);
  --muted: hsl(160 30% 85%);
  --muted-foreground: hsl(198 5% 35%);

  --font-sans: #{$font-sans};
  --font-display: #{$font-display};
  --font-code: #{$font-code};

  --gradient-background: #{$gradient-background-light};
  --gradient-text: #{$gradient-text-light};
  --gradient-heading: linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%);
  --gradient-separator: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  --gradient-border: #{$gradient-border-light};

  --shadow-glow: 0 0 15px rgba(59, 130, 246, 0.3);
  --shadow-soft: #{$shadow-soft-light};

  --glitch-color1: rgba(255, 0, 255, 0.8); // Enhanced Magenta
  --glitch-color2: rgba(0, 255, 255, 0.8); // Enhanced Cyan
  --glitch-color3: rgba(255, 255, 0, 0.8); // Enhanced Yellow
  --glitch-color4: rgba(0, 255, 0, 0.8); // Enhanced Green
  --glitch-shadow: rgba(62, 184, 229, 0.7); // Light blue glow
  --glitch-text-base: #000;
  --glitch-blur: 0.75px;
  --glitch-noise-opacity: 0.15;
  --glitch-gap: 0.25;

  --separator-shadow-color1: #2563eb;
  --separator-shadow-color2: #9333ea;
  --separator-pulse-color1: #2563eb;
  --separator-pulse-color2: rgba(37, 99, 235, 0.5);
  --separator-pulse-color3: #9333ea;
  --separator-pulse-color4: rgba(147, 51, 234, 0.5);

  --gradient-header-overlay: linear-gradient(to bottom,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.6) 100%);
  --shadow-header: 0 4px 30px rgba(0, 0, 0, 0.1);

  --border-muted: hsl(214.3, 31.8%, 85%);

  // Code block colors
  --code-bg: hsl(210, 40%, 98%);
  --code-fg: hsl(222.2, 84%, 4.9%);
  --code-border: hsl(214.3, 31.8%, 91.4%);
  --code-line-highlight: hsl(210, 40%, 90%);
  --code-line-number: hsl(215.4, 16.3%, 46.9%);

  // Math specific variables
  --math-bg: hsla(210, 40%, 98%, 0.95);
  --math-bg-transparent: hsla(210, 40%, 98%, 0.4);
  --math-border: hsla(214.3, 31.8%, 91.4%, 0.6);
  --math-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  --math-hover-shadow: 0 8px 30px rgba(59, 130, 246, 0.15);
  --math-equation-bg: hsla(210, 40%, 98%, 0.9);

  --glitch-shadow-1: 2px 2px #ff00c1, -2px -2px #00fff9;
  --glitch-shadow-2: 3px 3px #ff00c1, -3px -3px #00fff9;
  --glitch-shadow-3: 1px 1px #ff00c1, -1px -1px #00fff9;
  --glitch-color-1: #ff00c1;
  --glitch-color-2: #00fff9;

  --math-controls-bg: hsla(210, 40%, 98%, 0.95);
  --math-controls-hover: hsla(210, 40%, 95%, 1);
  --math-controls-text: hsl(215.4, 16.3%, 46.9%);
  --math-controls-text-hover: hsl(222.2, 47.4%, 11.2%);
  --math-display-number: hsl(215, 20%, 65%);
  --math-display-number-hover: hsl(215, 20%, 40%);

  // Enhanced 404 page variables
  --cyber-grid-color: rgba(59, 130, 246, 0.1);
  --cyber-grid-size: 30px;
  --glitch-blur-intensity: 2px;
  --noise-intensity: 0.1;
  --scan-line-color: rgba(0, 0, 0, 0.1);

  // Typography
  --heading-color: hsl(198 5% 10%);
  --heading-color-hover: hsl(198 33.6% 56.3%);
  --text-color: hsl(198 5% 20%);
  --text-color-muted: hsl(198 5% 40%);
  --link-color: var(--primary);
  --link-color-hover: var(--primary-foreground);
  --code-bg: hsl(210 40% 96%);
  --code-color: hsl(198 5% 20%);
  --blockquote-bg: hsl(210 40% 96.1%);
  --blockquote-color: hsl(198 5% 40%);
  --blockquote-border: var(--primary);

  --card-gradient-from: rgba(255, 255, 255, 0.8);
  --card-gradient-to: rgba(255, 255, 255, 0.3);
  --card-border: rgba(255, 255, 255, 0.5);
  --card-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  --card-hover-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);

  @each $name, $value in $light-math-colors {
    --#{$name}: #{$value};
  }

  // Header specific colors
  --post-header-gradient-from: rgb(255, 255, 255);
  --post-header-gradient-via: rgb(249, 250, 251);
  --post-header-gradient-to: rgb(243, 244, 246);
  --post-header-border: rgb(229, 231, 235);
  --post-header-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --post-header-hover-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.05);
  --post-header-image-overlay: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.8) 100%
  );

  // Back link specific colors
  --back-link-bg: rgba(255, 255, 255, 0.8);
  --back-link-hover-bg: rgba(255, 255, 255, 0.95);
  --back-link-border: rgba(229, 231, 235, 0.5);
  --back-link-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);
  --back-link-hover-shadow:
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.05);

  --subtitle-gradient-start: #3b82f6;
  --subtitle-gradient-end: #ec4899;

  // Selection colors
  --selection-bg: hsl(321, 100%, 78%, 0.2); // Soft pink
  --selection-text: hsl(321, 100%, 45%); // Deep pink
  --selection-heading-bg: hsl(262, 100%, 78%, 0.25); // Soft purple
  --selection-heading-text: hsl(262, 100%, 45%); // Deep purple
}

// Dark Theme Variables
@mixin dark {
  --primary-rgb: 59, 130, 246; // Add this if not present
  --primary: rgb(var(--primary-rgb));
  --background: hsl(198 50% 5%);
  --foreground: hsl(198 5% 90%);
  --primary: hsl(198 33.6% 56.3%);
  --primary-foreground: hsl(0, 0%, 100%);
  --secondary: hsl(#{$color-hue}, 30%, 10%);
  --secondary-foreground: hsl(0, 0%, 100%);
  --accent: hsl(217.2, 32.6%, 20%);
  --accent-foreground: hsl(210, 40%, 98%);
  --destructive: hsl(0, 100%, 30%);
  --destructive-foreground: hsl(#{$color-hue}, 5%, 90%);
  --border: hsl(198 30% 18%);
  --input: hsl(198 30% 18%);
  --ring: hsl(198 33.6% 56.3%);
  --radius: 0.5rem;

  --card: hsl(198 50% 0%);
  --card-foreground: hsl(198 5% 90%);
  --popover: hsl(#{$color-hue}, 50%, 5%);
  --popover-foreground: hsl(#{$color-hue}, 5%, 90%);
  --muted: hsl(160 30% 15%);
  --muted-foreground: hsl(198 5% 60%);

  --font-sans: #{$font-sans};
  --font-display: #{$font-display};
  --font-code: #{$font-code};

  --gradient-background: #{$gradient-background-dark};
  --gradient-text: #{$gradient-text-dark};
  --gradient-heading: linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #f472b6 100%);
  --gradient-separator: linear-gradient(90deg, #0fd850 0%, #f9f047 100%);
  --gradient-border: #{$gradient-border-dark};

  --shadow-glow: 0 0 15px rgba(59, 130, 246, 0.5);
  --shadow-soft: #{$shadow-soft-dark};

  --glitch-color1: rgba(255, 0, 255, 0.9); // Enhanced Brighter Magenta
  --glitch-color2: rgba(0, 255, 255, 0.9); // Enhanced Brighter Cyan
  --glitch-color3: rgba(255, 255, 0, 0.9); // Enhanced Brighter Yellow
  --glitch-color4: rgba(0, 255, 0, 0.9); // Enhanced Brighter Green
  --glitch-shadow: rgba(80, 200, 245, 0.8); // Bright blue glow
  --glitch-text-base: #fff;
  --glitch-blur: 1px;
  --glitch-noise-opacity: 0.2;
  --glitch-gap: 0.5;

  --separator-shadow-color1: #3b82f6;
  --separator-shadow-color2: #6366f1;
  --separator-pulse-color1: #3b82f6;
  --separator-pulse-color2: rgba(59, 130, 246, 0.5);
  --separator-pulse-color3: #6366f1;
  --separator-pulse-color4: rgba(99, 102, 241, 0.5);

  --gradient-header-overlay: linear-gradient(to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.2) 50%,
      rgba(0, 0, 0, 0.6) 100%);
  --shadow-header: 0 4px 30px rgba(0, 0, 0, 0.3);

  --border-muted: hsl(217.2, 32.6%, 25%);

  // Code block colors
  --code-bg: hsl(222.2, 84%, 6.9%);
  --code-fg: hsl(210, 40%, 98%);
  --code-border: hsl(217.2, 32.6%, 17.5%);
  --code-line-highlight: hsl(217.2, 32.6%, 12%);
  --code-line-number: hsl(215, 20.2%, 65.1%);

  // Math specific variables
  --math-bg: hsla(222.2, 84%, 4.9%, 0.8);
  --math-bg-transparent: hsla(222.2, 84%, 4.9%, 0.4);
  --math-border: hsla(217.2, 32.6%, 17.5%, 0.6);
  --math-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  --math-hover-shadow: 0 8px 30px rgba(59, 130, 246, 0.25);
  --math-equation-bg: hsla(222.2, 84%, 4.9%, 0.8);

  --glitch-shadow-1: 2px 2px #ff00ea, -2px -2px #00ffff;
  --glitch-shadow-2: 3px 3px #ff00ea, -3px -3px #00ffff;
  --glitch-shadow-3: 1px 1px #ff00ea, -1px -1px #00ffff;
  --glitch-color-1: #ff00ea;
  --glitch-color-2: #00ffff;

  --math-controls-bg: hsla(222.2, 84%, 4.9%, 0.9);
  --math-controls-hover: hsla(222.2, 84%, 4.9%, 1);
  --math-controls-text: hsl(215, 20.2%, 65.1%);
  --math-controls-text-hover: hsl(210, 40%, 98%);
  --math-display-number: hsl(215, 20%, 65%);
  --math-display-number-hover: hsl(215, 20%, 90%);

  // Enhanced 404 page variables
  --cyber-grid-color: rgba(59, 130, 246, 0.2);
  --cyber-grid-size: 30px;
  --glitch-blur-intensity: 3px;
  --noise-intensity: 0.15;
  --scan-line-color: rgba(255, 255, 255, 0.1);

  --link-color-hover: var(--primary-foreground);
  --code-bg: hsl(198 50% 10%);
  --code-color: hsl(198 5% 80%);
  --blockquote-bg: hsl(198 50% 7%);
  --blockquote-color: hsl(198 5% 65%);
  --blockquote-border: var(--primary);

  --card-gradient-from: rgba(30, 30, 30, 0.8);
  --card-gradient-to: rgba(20, 20, 20, 0.3);
  --card-border: rgba(255, 255, 255, 0.1);
  --card-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  --card-hover-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);

  @each $name, $value in $dark-math-colors {
    --#{$name}: #{$value};
  }

  // Header specific colors
  --post-header-gradient-from: rgb(17, 24, 39);
  --post-header-gradient-via: rgb(31, 41, 55);
  --post-header-gradient-to: rgb(55, 65, 81);
  --post-header-border: rgb(75, 85, 99);
  --post-header-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.5),
    0 2px 4px -2px rgba(0, 0, 0, 0.4);
  --post-header-hover-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.5),
    0 8px 10px -6px rgba(0, 0, 0, 0.4);
  --post-header-image-overlay: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.9) 100%
  );

  // Back link specific colors
  --back-link-bg: rgba(17, 24, 39, 0.8);
  --back-link-hover-bg: rgba(31, 41, 55, 0.95);
  --back-link-border: rgba(75, 85, 99, 0.5);
  --back-link-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.3);
  --back-link-hover-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.2);

  --subtitle-gradient-start: #60a5fa;
  --subtitle-gradient-end: #f472b6;

  // Selection colors
  --selection-bg: hsl(321, 90%, 65%, 0.2); // Bright pink
  --selection-text: hsl(321, 90%, 75%); // Light pink
  --selection-heading-bg: hsl(262, 90%, 65%, 0.25); // Bright purple
  --selection-heading-text: hsl(262, 90%, 75%); // Light purple
}
```

---

</SwmSnippet>

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBcGVyc29uYWwtd2Vic2l0ZSUzQSUzQXd5YXR0b3dhbHNo" repo-name="personal-website"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
