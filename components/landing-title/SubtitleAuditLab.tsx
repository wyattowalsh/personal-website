'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { LandingTitle } from '@/components/LandingTitle';
import {
  LANDING_TITLE_SUBTITLE_OPTIONS,
  resolveSubtitleOption,
} from '@/components/landing-title/registry';
import type { SubtitleLane } from '@/components/landing-title/shared';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/* ── option tuples ────────────────────────────────────────────────────────── */

const VIEW_OPTIONS = ['single', 'matrix'] as const;
const THEME_OPTIONS = ['system', 'light', 'dark'] as const;
const MOTION_OPTIONS = ['system', 'animated', 'reduced'] as const;
const FRAME_OPTIONS = ['desktop', 'tablet', 'mobile'] as const;
const LANE_ORDER = ['systems', 'arcane', 'crafted', 'performance'] as const satisfies readonly SubtitleLane[];
const LANE_FILTER_OPTIONS = ['all', ...LANE_ORDER] as const;
const LANE_LABELS: Record<SubtitleLane, string> = {
  systems: 'Systems Theatre',
  arcane: 'Arcane Instruments',
  crafted: 'Crafted Objects',
  performance: 'Performance Machines',
};

const LANE_DESCRIPTIONS: Record<SubtitleLane, string> = {
  systems: 'Blueprint panels, command meshes, routing instruments.',
  arcane: 'Ritual seals, signal divination, computational spellcraft.',
  crafted: 'Material workshops, forge surfaces, sculptural tools.',
  performance: 'Timing rigs, kinetic machinery, synaptic stage lights.',
};

type FrameMode = (typeof FRAME_OPTIONS)[number];

const FRAME_CLASS_MAP: Record<FrameMode, string> = {
  desktop: 'w-full max-w-6xl',
  tablet: 'w-full max-w-4xl',
  mobile: 'w-full max-w-md',
};

function pickParam<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/* ── select-option helpers ────────────────────────────────────────────────── */

interface SelectOption {
  value: string;
  label: string;
}

function toSelectOptions(values: readonly string[]): SelectOption[] {
  return values.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));
}

const SUBTITLE_SELECT_OPTIONS: SelectOption[] = LANDING_TITLE_SUBTITLE_OPTIONS.map(({ id, text }) => ({
  value: id,
  label: text,
}));

/* ── reusable labelled select ─────────────────────────────────────────────── */

interface ControlSelectProps {
  label: string;
  value: string;
  options: readonly SelectOption[];
  onValueChange: (value: string) => void;
}

function ControlSelect({ label, value, options, onValueChange }: ControlSelectProps) {
  const labelId = `subtitle-audit-${label.toLowerCase()}-label`;
  return (
    <div className="space-y-2">
      <label
        id={labelId}
        className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground"
      >
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger aria-labelledby={labelId} className="w-full">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ── main lab component ───────────────────────────────────────────────────── */

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
  const laneFilter = pickParam(searchParams.get('lane'), LANE_FILTER_OPTIONS, 'all');
  const showSignalDeck = searchParams.get('deck') !== '0';

  // Capture initial theme on mount, restore on unmount
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
    if (hasCapturedInitialThemeRef.current) {
      setTheme(themeMode);
    }
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
  const forcedPreviewIsDark = themeMode === 'system' ? undefined : themeMode === 'dark';

  const matrixGroups = useMemo(
    () => LANE_ORDER
      .filter((lane) => laneFilter === 'all' || lane === laneFilter)
      .map((lane) => ({
        lane,
        options: LANDING_TITLE_SUBTITLE_OPTIONS.filter((option) => option.lane === lane),
      })),
    [laneFilter],
  );
  const visibleSubtitleCount = matrixGroups.reduce((total, { options }) => total + options.length, 0);

  const goToRelativeSubtitle = (delta: number) => {
    const total = LANDING_TITLE_SUBTITLE_OPTIONS.length;
    const nextIndex = (selectedIndex + delta + total) % total;
    updateParams({ subtitle: LANDING_TITLE_SUBTITLE_OPTIONS[nextIndex].id });
  };

  // Props shared by every LandingTitle preview instance
  const sharedPreviewProps = {
    disableRotation: true as const,
    forcedIsDark: forcedPreviewIsDark,
    forceReducedMotion: reducedMotionOverride,
    framed: false as const,
    hideSignalDeck: !showSignalDeck,
    surface: 'audit' as const,
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
            Inspect every homepage subtitle before the ground up rebuild
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Lock any of the {LANDING_TITLE_SUBTITLE_OPTIONS.length} subtitle variants, switch theme
            and motion states, and compare them in either focused or matrix view before the dedicated
            redesign lanes start swapping in bespoke renderers.
          </p>
        </div>
      </header>

      <section
        className="grid gap-4 rounded-[1.75rem] border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur sm:p-5 lg:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,0.75fr))_auto] lg:items-end"
        data-subtitle-controls
      >
        <ControlSelect
          label="Subtitle"
          value={selectedSubtitle.id}
          options={SUBTITLE_SELECT_OPTIONS}
          onValueChange={(v) => updateParams({ subtitle: v })}
        />
        <ControlSelect
          label="View"
          value={viewMode}
          options={toSelectOptions(VIEW_OPTIONS)}
          onValueChange={(v) => updateParams({ view: v })}
        />
        <ControlSelect
          label="Theme"
          value={themeMode}
          options={toSelectOptions(THEME_OPTIONS)}
          onValueChange={(v) => updateParams({ theme: v })}
        />
        <ControlSelect
          label="Motion"
          value={motionMode}
          options={toSelectOptions(MOTION_OPTIONS)}
          onValueChange={(v) => updateParams({ motion: v })}
        />
        <ControlSelect
          label="Frame"
          value={frameMode}
          options={toSelectOptions(FRAME_OPTIONS)}
          onValueChange={(v) => updateParams({ frame: v })}
        />
        <ControlSelect
          label="Lane"
          value={laneFilter}
          options={toSelectOptions(LANE_FILTER_OPTIONS)}
          onValueChange={(v) => updateParams({ lane: v })}
        />

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2 lg:min-h-10">
          <div className="space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Signal deck
            </p>
            <p className="text-xs text-muted-foreground">
              Keep or hide audit metadata.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={showSignalDeck}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              showSignalDeck ? 'bg-primary' : 'bg-input',
            )}
            onClick={() => updateParams({ deck: showSignalDeck ? '0' : '1' })}
            aria-label="Toggle subtitle signal deck"
          >
            <span
              className={cn(
                'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
                showSignalDeck ? 'translate-x-4' : 'translate-x-0',
              )}
            />
          </button>
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
          'overflow-hidden rounded-[2rem] border border-border/60 bg-[radial-gradient(circle_at_12%_0%,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_34%),linear-gradient(180deg,color-mix(in_srgb,var(--background)_92%,transparent),color-mix(in_srgb,var(--muted)_18%,transparent))] p-4 shadow-sm backdrop-blur sm:p-6',
          viewMode === 'single' ? FRAME_CLASS_MAP[frameMode] : 'w-full',
        )}
        data-subtitle-preview
        data-subtitle-loaded-count={viewMode === 'matrix' ? visibleSubtitleCount : 1}
      >
        {viewMode === 'single' ? (
          <div className="space-y-4">
            {showSignalDeck ? (
              <div className="flex flex-wrap items-end justify-between gap-3 rounded-[1.4rem] border border-border/60 bg-background/75 px-4 py-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    {selectedSubtitle.signalDeck.family}
                  </p>
                  <p className="text-sm font-medium text-foreground sm:text-base">{selectedSubtitle.text}</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">{selectedSubtitle.signalDeck.descriptor}</p>
                </div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  {selectedSubtitle.lane}
                </p>
              </div>
            ) : null}
            <LandingTitle forcedSubtitleId={selectedSubtitle.id} {...sharedPreviewProps} />
          </div>
        ) : (
          <div className="space-y-10" data-subtitle-matrix>
            {matrixGroups.map(({ lane, options }) => (
              <section key={lane} className="space-y-4" data-subtitle-lane-group={lane}>
                <div className="relative overflow-hidden rounded-[1.5rem] border border-border/60 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--background)_88%,transparent),color-mix(in_srgb,var(--muted)_22%,transparent))] px-4 py-3 shadow-sm">
                  <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
                  <div className="relative flex flex-wrap items-end justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-primary/80">
                      {LANE_LABELS[lane]}
                    </p>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {LANE_DESCRIPTIONS[lane]}
                    </p>
                  </div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    {options.length} variants
                  </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {options.map((option, index) => (
                    <div
                      key={option.id}
                      className={cn(
                        'relative overflow-hidden rounded-[1.6rem] border border-border/60 bg-[radial-gradient(circle_at_18%_0%,color-mix(in_srgb,var(--primary)_8%,transparent),transparent_32%),linear-gradient(180deg,color-mix(in_srgb,var(--background)_88%,transparent),color-mix(in_srgb,var(--background)_72%,var(--muted)_16%))] p-4 shadow-sm transition-shadow duration-200',
                        'before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/25 before:to-transparent',
                        option.id === selectedSubtitle.id && 'ring-1 ring-primary/40',
                      )}
                      data-subtitle-card={option.id}
                    >
                      <div className="relative mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                              {String(index + 1).padStart(2, '0')}
                            </p>
                            {showSignalDeck ? (
                              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-muted-foreground/80">
                                {option.signalDeck.family}
                              </p>
                            ) : null}
                          </div>
                          <p className="break-words text-sm font-medium text-foreground">{option.text}</p>
                          {showSignalDeck ? (
                            <p className="line-clamp-2 text-xs text-muted-foreground">{option.signalDeck.descriptor}</p>
                          ) : null}
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
                        {...sharedPreviewProps}
                        showName={false}
                        compact
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
