'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { LandingTitle } from '@/components/LandingTitle';
import {
  DEFAULT_LANDING_TITLE_SUBTITLE_ID,
  LANDING_TITLE_SUBTITLE_OPTIONS,
  resolveSubtitleOption,
} from '@/components/landing-title/registry';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const VIEW_OPTIONS = ['single', 'matrix'] as const;
const THEME_OPTIONS = ['system', 'light', 'dark'] as const;
const MOTION_OPTIONS = ['system', 'animated', 'reduced'] as const;
const FRAME_OPTIONS = ['desktop', 'tablet', 'mobile'] as const;
const DEFAULT_SUBTITLE = DEFAULT_LANDING_TITLE_SUBTITLE_ID;
const SUBTITLE_LABEL_ID = 'subtitle-audit-subtitle-label';
const VIEW_LABEL_ID = 'subtitle-audit-view-label';
const THEME_LABEL_ID = 'subtitle-audit-theme-label';
const MOTION_LABEL_ID = 'subtitle-audit-motion-label';
const FRAME_LABEL_ID = 'subtitle-audit-frame-label';

type FrameMode = (typeof FRAME_OPTIONS)[number];

function pickParam<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

const FRAME_CLASS_MAP: Record<FrameMode, string> = {
  desktop: 'w-full max-w-6xl',
  tablet: 'w-full max-w-4xl',
  mobile: 'w-full max-w-md',
};

export function SubtitleAuditLab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setTheme, theme } = useTheme();
  const previousThemeRef = useRef<string | null>(null);
  const hasCapturedInitialThemeRef = useRef(false);

  const selectedSubtitle = resolveSubtitleOption(searchParams.get('subtitle'));
  const viewMode = pickParam(searchParams.get('view'), VIEW_OPTIONS, 'single');
  const themeMode = pickParam(searchParams.get('theme'), THEME_OPTIONS, 'system');
  const motionMode = pickParam(searchParams.get('motion'), MOTION_OPTIONS, 'system');
  const frameMode = pickParam(searchParams.get('frame'), FRAME_OPTIONS, 'desktop');
  const showSignalDeck = searchParams.get('deck') !== '0';

  useEffect(() => {
    if (!hasCapturedInitialThemeRef.current && theme) {
      previousThemeRef.current = theme;
      hasCapturedInitialThemeRef.current = true;
    }
  }, [theme]);

  useEffect(() => {
    return () => {
      if (previousThemeRef.current) {
        setTheme(previousThemeRef.current);
      }
    };
  }, [setTheme]);

  useEffect(() => {
    if (!hasCapturedInitialThemeRef.current) {
      return;
    }

    setTheme(themeMode);
  }, [setTheme, themeMode]);

  const updateParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    }

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const selectedIndex = Math.max(
    0,
    LANDING_TITLE_SUBTITLE_OPTIONS.findIndex(({ id }) => id === selectedSubtitle.id),
  );
  const reducedMotionOverride =
    motionMode === 'system' ? undefined : motionMode === 'reduced';

  const matrixThemes = useMemo(() => {
    return [
      selectedSubtitle,
      ...LANDING_TITLE_SUBTITLE_OPTIONS.filter(({ id }) => id !== selectedSubtitle.id),
    ];
  }, [selectedSubtitle]);

  const goToRelativeSubtitle = (delta: number) => {
    const total = LANDING_TITLE_SUBTITLE_OPTIONS.length;
    const nextIndex = (selectedIndex + delta + total) % total;
    updateParams({ subtitle: LANDING_TITLE_SUBTITLE_OPTIONS[nextIndex]?.id ?? DEFAULT_SUBTITLE });
  };

  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8"
      data-subtitle-audit-lab
    >
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
          Subtitle Audit Lab
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Inspect every homepage subtitle before the ground-up rebuild
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Lock any of the {LANDING_TITLE_SUBTITLE_OPTIONS.length} subtitle variants, switch theme and
            motion states, and compare them in either focused or matrix view before the dedicated
            redesign lanes start swapping in bespoke renderers.
          </p>
        </div>
      </header>

      <section
        className="grid gap-4 rounded-[1.75rem] border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur sm:p-5 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.75fr))_auto] lg:items-end"
        data-subtitle-controls
      >
        <div className="space-y-2">
          <label
            id={SUBTITLE_LABEL_ID}
            className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground"
          >
            Subtitle
          </label>
          <Select
            value={selectedSubtitle.id}
            onValueChange={(value) => updateParams({ subtitle: value })}
          >
            <SelectTrigger aria-labelledby={SUBTITLE_LABEL_ID} className="w-full">
              <SelectValue placeholder="Select subtitle" />
            </SelectTrigger>
            <SelectContent>
              {LANDING_TITLE_SUBTITLE_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label
            id={VIEW_LABEL_ID}
            className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground"
          >
            View
          </label>
          <Select
            value={viewMode}
            onValueChange={(value) => updateParams({ view: value })}
          >
            <SelectTrigger aria-labelledby={VIEW_LABEL_ID} className="w-full">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="matrix">Matrix</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label
            id={THEME_LABEL_ID}
            className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground"
          >
            Theme
          </label>
          <Select
            value={themeMode}
            onValueChange={(value) => updateParams({ theme: value })}
          >
            <SelectTrigger aria-labelledby={THEME_LABEL_ID} className="w-full">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label
            id={MOTION_LABEL_ID}
            className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground"
          >
            Motion
          </label>
          <Select
            value={motionMode}
            onValueChange={(value) => updateParams({ motion: value })}
          >
            <SelectTrigger aria-labelledby={MOTION_LABEL_ID} className="w-full">
              <SelectValue placeholder="Select motion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="animated">Animated</SelectItem>
              <SelectItem value="reduced">Reduced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label
            id={FRAME_LABEL_ID}
            className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground"
          >
            Frame
          </label>
          <Select
            value={frameMode}
            onValueChange={(value) => updateParams({ frame: value })}
          >
            <SelectTrigger aria-labelledby={FRAME_LABEL_ID} className="w-full">
              <SelectValue placeholder="Select frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desktop">Desktop</SelectItem>
              <SelectItem value="tablet">Tablet</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2 lg:min-h-10">
          <div className="space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Signal deck
            </p>
            <p className="text-xs text-muted-foreground">
              Keep or hide the metadata strip.
            </p>
          </div>
          <Switch
            checked={showSignalDeck}
            onCheckedChange={(checked) => updateParams({ deck: checked ? '1' : '0' })}
            aria-label="Toggle subtitle signal deck"
          />
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => router.replace(pathname, { scroll: false })}
          >
            Reset
          </Button>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3" data-subtitle-navigation>
        <Button variant="outline" onClick={() => goToRelativeSubtitle(-1)}>
          Previous subtitle
        </Button>
        <Button variant="outline" onClick={() => goToRelativeSubtitle(1)}>
          Next subtitle
        </Button>
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          {String(selectedIndex + 1).padStart(2, '0')} / {LANDING_TITLE_SUBTITLE_OPTIONS.length}
        </p>
      </section>

      <section
        className={cn(
          'rounded-[2rem] border border-border/60 bg-background/60 p-4 shadow-sm backdrop-blur sm:p-6',
          viewMode === 'single' ? FRAME_CLASS_MAP[frameMode] : 'w-full',
        )}
        data-subtitle-preview
      >
        {viewMode === 'single' ? (
          <LandingTitle
            forcedSubtitleId={selectedSubtitle.id}
            disableRotation
            forceReducedMotion={reducedMotionOverride}
            hideSignalDeck={!showSignalDeck}
          />
        ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-subtitle-matrix>
              {matrixThemes.map((option, index) => (
                <div
                  key={option.id}
                  className={cn(
                    'rounded-[1.5rem] border border-border/60 bg-background/80 p-4 shadow-sm',
                    option.id === selectedSubtitle.id && 'ring-1 ring-primary/40',
                  )}
                  data-subtitle-card={option.id}
                >
                 <div className="mb-3 flex items-center justify-between gap-3">
                   <div className="min-w-0 space-y-1">
                     <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                       {String(index + 1).padStart(2, '0')}
                     </p>
                     <p className="truncate text-sm font-medium text-foreground">{option.text}</p>
                   </div>
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => updateParams({ subtitle: option.id, view: 'single' })}
                   >
                     Focus
                   </Button>
                 </div>
                 <LandingTitle
                   forcedSubtitleId={option.id}
                   disableRotation
                   forceReducedMotion={reducedMotionOverride}
                   hideSignalDeck={!showSignalDeck}
                  showName={false}
                  compact
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
