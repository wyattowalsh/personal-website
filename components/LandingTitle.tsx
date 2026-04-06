'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';

import {
  getSubtitleRenderer,
  getSubtitleRendererById,
  LANDING_TITLE_RENDERERS,
  LANDING_TITLE_THEME_TEXTS,
  type LandingTitleRendererContext,
  type LandingTitleRendererEntry,
} from '@/components/landing-title/registry';
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import styles from '@/components/landing-title/subtitle.module.css';
import { buildRotationSequence } from '@/lib/landing-title-sequence';
import { cn } from '@/lib/utils';

const ANIMATION_INTERVAL = 4200;

export { LANDING_TITLE_THEME_TEXTS };

export interface LandingTitleProps {
  forcedSubtitleId?: string;
  forcedThemeText?: string;
  disableRotation?: boolean;
  forceReducedMotion?: boolean;
  hideSignalDeck?: boolean;
  showName?: boolean;
  compact?: boolean;
  className?: string;
}

function withAlpha(color: string, alpha: number): string {
  return color.replace(/[\d.]+\)\s*$/, `${alpha})`);
}

export function LandingTitle({
  forcedSubtitleId,
  forcedThemeText,
  disableRotation = false,
  forceReducedMotion,
  hideSignalDeck = false,
  showName = true,
  compact = false,
  className,
}: LandingTitleProps = {}) {
  const hasHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const systemPrefersReducedMotion = useReducedMotion();
  const prefersReducedMotion = forceReducedMotion ?? (!hasHydrated || systemPrefersReducedMotion);
  const { resolvedTheme } = useTheme();
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleStartedAtRef = useRef<number | null>(null);
  const elapsedCycleMsRef = useRef(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [rotationSequence, setRotationSequence] = useState<LandingTitleRendererEntry[]>(LANDING_TITLE_RENDERERS);
  const [isShellHovered, setIsShellHovered] = useState(false);
  const [isShellFocused, setIsShellFocused] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);

  const forcedRenderer = forcedSubtitleId
    ? getSubtitleRendererById(forcedSubtitleId)
    : forcedThemeText
      ? getSubtitleRenderer(forcedThemeText)
      : null;
  const isRotationEnabled = !prefersReducedMotion && !disableRotation && !forcedRenderer;
  const forcedRendererIndex = forcedRenderer
    ? LANDING_TITLE_RENDERERS.findIndex(({ id }) => id === forcedRenderer.id)
    : -1;

  useEffect(() => {
    if (!isRotationEnabled) {
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      setRotationSequence(buildRotationSequence(LANDING_TITLE_RENDERERS));
    });

    return () => cancelAnimationFrame(frame);
  }, [isRotationEnabled]);

  const advance = useCallback(() => {
    setWordIndex((previousIndex) => {
      if (previousIndex + 1 < rotationSequence.length) {
        return previousIndex + 1;
      }

      const previousRenderer =
        rotationSequence[previousIndex] ?? rotationSequence[rotationSequence.length - 1] ?? null;
      setRotationSequence(buildRotationSequence(LANDING_TITLE_RENDERERS, previousRenderer));
      return 0;
    });
  }, [rotationSequence]);

  const cancelScheduledAdvance = useCallback(() => {
    if (advanceTimeoutRef.current !== null) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  }, []);

  const syncCycleProgress = useCallback(() => {
    if (cycleStartedAtRef.current === null) {
      return;
    }

    elapsedCycleMsRef.current = Math.min(
      elapsedCycleMsRef.current + (performance.now() - cycleStartedAtRef.current),
      ANIMATION_INTERVAL,
    );
    cycleStartedAtRef.current = null;
  }, []);

  const pauseRotation = useCallback(() => {
    syncCycleProgress();
    cancelScheduledAdvance();
  }, [cancelScheduledAdvance, syncCycleProgress]);

  const startRotation = useCallback(() => {
    cancelScheduledAdvance();

    const remainingMs = Math.max(ANIMATION_INTERVAL - elapsedCycleMsRef.current, 16);
    cycleStartedAtRef.current = performance.now();

    advanceTimeoutRef.current = setTimeout(() => {
      cancelScheduledAdvance();
      cycleStartedAtRef.current = null;
      elapsedCycleMsRef.current = 0;
      advance();
    }, remainingMs);
  }, [advance, cancelScheduledAdvance]);

  useEffect(() => {
    if (!isRotationEnabled) {
      return undefined;
    }

    const handleVisibilityChange = () => {
      setIsDocumentVisible(!document.hidden);
    };

    handleVisibilityChange();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRotationEnabled]);

  useEffect(() => {
    elapsedCycleMsRef.current = 0;
    cycleStartedAtRef.current = null;
  }, [wordIndex]);

  const isRotationPaused =
    !isRotationEnabled
    || isShellHovered
    || isShellFocused
    || !isDocumentVisible;

  useEffect(() => {
    if (isRotationPaused) {
      pauseRotation();
      return undefined;
    }

    startRotation();

    return () => {
      pauseRotation();
    };
  }, [isRotationPaused, pauseRotation, startRotation, wordIndex]);

  const handleDeckMouseEnter = useCallback(() => {
    if (isRotationEnabled) {
      setIsShellHovered(true);
    }
  }, [isRotationEnabled]);

  const handleDeckMouseLeave = useCallback(() => {
    if (isRotationEnabled) {
      setIsShellHovered(false);
    }
  }, [isRotationEnabled]);

  const handleShellFocus = useCallback(() => {
    if (isRotationEnabled) {
      setIsShellFocused(true);
    }
  }, [isRotationEnabled]);

  const handleShellBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    if (isRotationEnabled) {
      setIsShellFocused(false);
    }
  }, [isRotationEnabled]);

  const currentRenderer =
    forcedRenderer ?? rotationSequence[wordIndex] ?? rotationSequence[0] ?? LANDING_TITLE_RENDERERS[0];
  const currentTheme = currentRenderer.theme;
  const isDark = resolvedTheme === 'dark';
  const shouldAnimateTagline = hasHydrated && !prefersReducedMotion;
  const positionLabel = String((forcedRendererIndex >= 0 ? forcedRendererIndex : wordIndex) + 1).padStart(2, '0');
  const totalLabel = String(LANDING_TITLE_RENDERERS.length).padStart(2, '0');
  const rotationStatusLabel = prefersReducedMotion
    ? 'Rotation is disabled to respect reduced motion.'
    : forcedRenderer || disableRotation
      ? 'Rotation is locked for inspection.'
      : 'Focus or hover pauses rotation.';

  const rendererContext: LandingTitleRendererContext = {
    compact,
    isDark,
    prefersReducedMotion,
    shouldAnimateTagline,
    showName,
    wordIndex,
  };

  return (
    <div
      data-motion-mode={prefersReducedMotion ? 'reduced' : 'animated'}
      className={cn(
        'relative z-10',
        'mx-auto w-full rounded-[1.75rem]',
        compact
          ? 'max-w-[28rem] px-3 py-3 sm:px-4 sm:py-4'
          : 'max-w-[48rem] px-2 py-1 sm:max-w-[48rem] sm:px-4 sm:py-2 md:px-6 md:py-4 lg:px-8 lg:py-6 xl:max-w-[52rem]',
        'flex flex-col items-center',
        'bg-linear-to-br',
        'from-background/40 via-background/18 to-transparent',
        'dark:from-background/28 dark:via-background/16 dark:to-background/6',
        'border border-primary/10',
        'dark:border-primary/20',
        'shadow-lg shadow-primary/5',
        'dark:shadow-primary/8',
        'transition-colors duration-300',
        className,
      )}
    >
      {showName ? (
        <h1
          className={cn(
            'relative cursor-default select-none bg-clip-text text-center font-extrabold leading-none tracking-tight text-transparent',
            'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
            prefersReducedMotion ? undefined : 'hover:scale-[1.02]',
            styles.enhancedTitleLanding,
            styles.heroTitle,
          )}
          style={{
            filter: `drop-shadow(0 0 ${isDark ? '20px' : '14px'} ${withAlpha(currentTheme.glow, isDark ? 0.5 : 0.3)})`,
            transition: prefersReducedMotion
              ? 'filter 0.6s ease'
              : 'filter 0.6s ease, transform 0.5s ease',
          }}
        >
          Wyatt Walsh
        </h1>
      ) : null}

      {currentRenderer.render({
        context: rendererContext,
        hideSignalDeck,
         onBlur: handleShellBlur,
         onFocus: handleShellFocus,
         onMouseEnter: isRotationEnabled ? handleDeckMouseEnter : undefined,
         onMouseLeave: isRotationEnabled ? handleDeckMouseLeave : undefined,
         positionLabel,
         rotationStatusLabel,
         totalLabel,
      })}
    </div>
  );
}
