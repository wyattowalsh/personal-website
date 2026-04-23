'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';

import {
  getSubtitleRenderer,
  getSubtitleRendererById,
  LANDING_TITLE_RENDERERS,
  LANDING_TITLE_THEME_TEXTS,
  type LandingTitleRendererContext,
  type LandingTitleRendererEntry,
  type SubtitleSurface,
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
  surface?: SubtitleSurface;
  framed?: boolean;
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
  surface = 'homepage',
  framed = true,
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
  const [allowAnimatedEntrance, setAllowAnimatedEntrance] = useState(false);

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
    if (!hasHydrated || prefersReducedMotion || forcedRenderer || disableRotation) {
      setAllowAnimatedEntrance(false);
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      setAllowAnimatedEntrance(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [disableRotation, forcedRenderer, hasHydrated, prefersReducedMotion]);

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
    setWordIndex((prev) => {
      if (prev + 1 < rotationSequence.length) return prev + 1;

      const last = rotationSequence[prev] ?? rotationSequence[rotationSequence.length - 1] ?? null;
      setRotationSequence(buildRotationSequence(LANDING_TITLE_RENDERERS, last));
      return 0;
    });
  }, [rotationSequence]);

  // Ref keeps startRotation stable while always calling the latest advance.
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  const pauseRotation = useCallback(() => {
    if (cycleStartedAtRef.current !== null) {
      elapsedCycleMsRef.current = Math.min(
        elapsedCycleMsRef.current + (performance.now() - cycleStartedAtRef.current),
        ANIMATION_INTERVAL,
      );
      cycleStartedAtRef.current = null;
    }
    if (advanceTimeoutRef.current !== null) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  }, []);

  const startRotation = useCallback(() => {
    if (advanceTimeoutRef.current !== null) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }

    const remainingMs = Math.max(ANIMATION_INTERVAL - elapsedCycleMsRef.current, 16);
    cycleStartedAtRef.current = performance.now();

    advanceTimeoutRef.current = setTimeout(() => {
      advanceTimeoutRef.current = null;
      cycleStartedAtRef.current = null;
      elapsedCycleMsRef.current = 0;
      advanceRef.current();
    }, remainingMs);
  }, []);

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
  const showAuditMeta = surface === 'audit' && !hideSignalDeck;

  const rendererContext: LandingTitleRendererContext = {
    allowAnimatedEntrance,
    compact,
    isDark,
    prefersReducedMotion,
    shouldAnimateTagline,
    showName,
    surface,
    wordIndex,
  };
  const subtitleNode = currentRenderer.render({
    context: rendererContext,
    onBlur: handleShellBlur,
    onFocus: handleShellFocus,
    onMouseEnter: isRotationEnabled ? handleDeckMouseEnter : undefined,
    onMouseLeave: isRotationEnabled ? handleDeckMouseLeave : undefined,
    rotationStatusLabel,
  });

  return (
    <div
      data-motion-mode={prefersReducedMotion ? 'reduced' : 'animated'}
      data-title-surface={surface}
      className={cn(
        'relative z-10',
        'mx-auto w-full',
        framed && 'rounded-[1.75rem]',
        compact
          ? 'max-w-[28rem] px-3 py-3 sm:px-4 sm:py-4'
          : framed
            ? 'max-w-[48rem] px-2 py-1 sm:max-w-[48rem] sm:px-4 sm:py-2 md:px-6 md:py-4 lg:px-8 lg:py-6 xl:max-w-[52rem]'
            : 'max-w-[48rem] px-0 py-0 sm:max-w-[48rem] md:px-2 lg:px-4 xl:max-w-[52rem]',
        'flex flex-col items-center',
        framed && 'bg-linear-to-br',
        framed && 'from-background/40 via-background/18 to-transparent',
        framed && 'dark:from-background/28 dark:via-background/16 dark:to-background/6',
        framed && 'border border-primary/10',
        framed && 'dark:border-primary/20',
        framed && 'shadow-lg shadow-primary/5',
        framed && 'dark:shadow-primary/8',
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

      {isRotationEnabled ? (
        <div className="grid w-full">
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={currentRenderer.id}
              className="col-start-1 row-start-1 w-full"
              initial={{ opacity: 0, y: 10, scale: 0.992, filter: 'blur(7px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, scale: 1.008, filter: 'blur(7px)' }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              {subtitleNode}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : subtitleNode}

      {showAuditMeta ? (
        <div className={styles.auditMeta} aria-hidden="true">
          <span className={styles.auditMetaBadge}>{currentRenderer.signalDeck.family}</span>
          <span className={styles.auditMetaText}>{currentRenderer.signalDeck.descriptor}</span>
          <span className={styles.auditMetaCounter}>
            {positionLabel} / {totalLabel}
          </span>
        </div>
      ) : null}
    </div>
  );
}
