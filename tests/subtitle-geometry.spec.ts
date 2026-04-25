import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

type SubtitleGeometry = {
  failures: string[];
  id: string;
  lane: string;
  text: string;
};

type ViewportCase = {
  height: number;
  name: string;
  width: number;
};

const VIEWPORTS: readonly ViewportCase[] = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 834, height: 1000 },
  { name: 'mobile-390', width: 390, height: 1000 },
  { name: 'mobile-320', width: 320, height: 1000 },
  { name: 'short-landscape', width: 844, height: 390 },
];

const THEMES = ['light', 'dark'] as const;
type SubtitleTheme = (typeof THEMES)[number];

type VisualMatrixCase = ViewportCase & {
  theme: SubtitleTheme;
};

const EXPECTED_SUBTITLE_COUNT = 22;
const MIN_LOCKUP_CLEARANCE_PX = 8;
const BROWSER_ISSUE_PATTERNS: readonly RegExp[] = [
  /hydration/i,
  /hydrated but some attributes/i,
  /did not match/i,
  /text content does not match/i,
];

const VISUAL_MATRIX_CASES: readonly VisualMatrixCase[] = [
  { name: 'desktop', width: 1440, height: 1000, theme: 'light' },
  { name: 'desktop', width: 1440, height: 1000, theme: 'dark' },
  { name: 'mobile-320', width: 320, height: 1000, theme: 'light' },
  { name: 'mobile-320', width: 320, height: 1000, theme: 'dark' },
];

function subtitlesUrl(theme: SubtitleTheme) {
  return `/lab/subtitles?${new URLSearchParams({
    deck: '0',
    motion: 'reduced',
    theme,
    view: 'matrix',
  }).toString()}`;
}

async function openSubtitleMatrix(page: Page, viewport: ViewportCase, theme: SubtitleTheme) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(subtitlesUrl(theme), { waitUntil: 'domcontentloaded' });
  await page.locator('[data-subtitle-id]').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}

function watchBrowserIssues(page: Page) {
  const issues: string[] = [];

  page.on('console', (message: ConsoleMessage) => {
    const text = message.text();
    if (message.type() === 'error' || BROWSER_ISSUE_PATTERNS.some((pattern) => pattern.test(text))) {
      issues.push(`[console:${message.type()}] ${text}`);
    }
  });

  page.on('pageerror', (error) => {
    issues.push(`[pageerror] ${error.message}`);
  });

  return issues;
}

test('every homepage subtitle matrix preview keeps title text inside its plate', async ({ page }) => {
  const failures: string[] = [];
  const browserIssues = watchBrowserIssues(page);

  for (const theme of THEMES) {
    for (const viewport of VIEWPORTS) {
      await openSubtitleMatrix(page, viewport, theme);

      const geometries = await page.locator('[data-subtitle-id]').evaluateAll((controls, minClearancePx) => {
        function rectOf(element: Element) {
          const rect = element.getBoundingClientRect();

          return {
            bottom: rect.bottom,
            height: rect.height,
            left: rect.left,
            right: rect.right,
            top: rect.top,
            width: rect.width,
          };
        }

        function unionRect(rects: DOMRect[]) {
          if (rects.length === 0) {
            return null;
          }

          const top = Math.min(...rects.map((rect) => rect.top));
          const right = Math.max(...rects.map((rect) => rect.right));
          const bottom = Math.max(...rects.map((rect) => rect.bottom));
          const left = Math.min(...rects.map((rect) => rect.left));

          return {
            bottom,
            height: bottom - top,
            left,
            right,
            top,
            width: right - left,
          };
        }

        function minInset(inner: ReturnType<typeof rectOf>, outer: ReturnType<typeof rectOf>) {
          return Math.min(
            inner.top - outer.top,
            outer.right - inner.right,
            outer.bottom - inner.bottom,
            inner.left - outer.left,
          );
        }

        function escapes(inner: ReturnType<typeof rectOf>, outer: ReturnType<typeof rectOf>, tolerancePx = 1) {
          return inner.left < outer.left - tolerancePx
            || inner.top < outer.top - tolerancePx
            || inner.right > outer.right + tolerancePx
            || inner.bottom > outer.bottom + tolerancePx;
        }

        function isClipping(element: Element) {
          const style = getComputedStyle(element);

          return style.clipPath !== 'none'
            || style.overflowX !== 'visible'
            || style.overflowY !== 'visible';
        }

        return controls.map((control): SubtitleGeometry => {
          const element = control as HTMLElement;
          const id = element.dataset.subtitleId ?? 'unknown';
          const lane = element.dataset.subtitleLane ?? 'unknown';
          const title = element.querySelector('h2') as HTMLElement | null;
          const failures: string[] = [];

          if (!title) {
            return { failures: ['missing h2'], id, lane, text: '' };
          }

          const text = title.textContent?.trim() ?? '';
          const lockup = title.parentElement;
          const scene = title.closest('section');
          const range = document.createRange();
          range.selectNodeContents(title);
          const rangeRects = [...range.getClientRects()].filter((rect) => rect.width > 1 && rect.height > 1);
          const textRect = unionRect(rangeRects) ?? rectOf(title);
          range.detach();

          const fontSize = Number.parseFloat(getComputedStyle(title).fontSize);
          const lineHeightRaw = getComputedStyle(title).lineHeight;
          const lineHeight = lineHeightRaw === 'normal'
            ? fontSize * 1.2
            : Number.parseFloat(lineHeightRaw);
          const lineHeightRatio = lineHeight / fontSize;

          if (!text) {
            failures.push('empty title text');
          }

          if (!Number.isFinite(lineHeightRatio) || lineHeightRatio < 1) {
            failures.push(`line-height/font-size ${lineHeightRatio.toFixed(2)} < 1.00`);
          }

          if (!lockup) {
            failures.push('missing title lockup');
          } else {
            const lockupRect = rectOf(lockup);
            const lockupClearance = minInset(textRect, lockupRect);

            if (lockupClearance < minClearancePx) {
              failures.push(`title clearance ${lockupClearance.toFixed(1)}px < ${minClearancePx}px`);
            }

            if (lockup.scrollWidth > lockup.clientWidth + 1) {
              failures.push(`lockup horizontal overflow ${lockup.scrollWidth}px > ${lockup.clientWidth}px`);
            }

            if (lockup.scrollHeight > lockup.clientHeight + 1) {
              failures.push(`lockup vertical overflow ${lockup.scrollHeight}px > ${lockup.clientHeight}px`);
            }
          }

          if (!scene) {
            failures.push('missing subtitle scene');
          } else if (escapes(textRect, rectOf(scene), 2)) {
            failures.push('title escapes subtitle scene');
          }

          let ancestor: Element | null = title;
          while (ancestor && ancestor !== element.parentElement) {
            if (ancestor !== title && isClipping(ancestor) && escapes(textRect, rectOf(ancestor))) {
              const name = ancestor.className ? String(ancestor.className) : ancestor.tagName.toLowerCase();
              failures.push(`title escapes clipping ancestor ${name}`);
            }
            ancestor = ancestor.parentElement;
          }

          return { failures, id, lane, text };
        });
      }, MIN_LOCKUP_CLEARANCE_PX);

      expect(new Set(geometries.map(({ id }) => id)).size).toBe(EXPECTED_SUBTITLE_COUNT);

      for (const geometry of geometries) {
        for (const failure of geometry.failures) {
          failures.push(`${theme}/${viewport.name}/${geometry.id} (${geometry.text}, ${geometry.lane}): ${failure}`);
        }
      }
    }
  }

  expect(failures).toEqual([]);
  expect(browserIssues).toEqual([]);
});

test('homepage subtitle matrix visual states stay intentional', async ({ page }) => {
  const browserIssues = watchBrowserIssues(page);

  for (const visualCase of VISUAL_MATRIX_CASES) {
    await openSubtitleMatrix(page, visualCase, visualCase.theme);

    await expect(page.locator('[data-subtitle-preview]')).toHaveScreenshot(
      `subtitle-matrix-${visualCase.name}-${visualCase.theme}.png`,
      {
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: 0.015,
      },
    );
  }

  expect(browserIssues).toEqual([]);
});
