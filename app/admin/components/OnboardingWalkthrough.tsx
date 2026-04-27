'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Admin Intelligence',
    description:
      'This dashboard gives you visitor analytics, content health, growth metrics, and deployment insights — all from free-tier services.',
    targetSelector: '[data-tour="hero"]',
  },
  {
    id: 'overview',
    title: 'Dashboard Overview',
    description:
      'At a glance: live provider count, visitor window, unique browsers, and any errors across integrated services.',
    targetSelector: '[data-tour="signals"]',
  },
  {
    id: 'tabs',
    title: 'Tab Navigation',
    description:
      'Switch between Visitors, Growth, Performance, Operations, Content, and Setup panels. Each tab loads data independently.',
    targetSelector: '[data-tour="tabs"]',
  },
  {
    id: 'export',
    title: 'Export Features',
    description:
      'Use the Analytics window selector to change date ranges. Data exports and rollups are available via the API routes.',
    targetSelector: '[data-tour="window-selector"]',
  },
  {
    id: 'settings',
    title: 'Settings & Setup',
    description:
      'The Setup tab shows which environment variables are configured. Add missing keys to unlock additional panels.',
    targetSelector: '[data-tour="setup"]',
  },
];

const STORAGE_KEY = 'admin_onboarding_complete';

function getElementCenter(selector: string): { x: number; y: number; width: number; height: number } | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    width: rect.width,
    height: rect.height,
  };
}

export function OnboardingWalkthrough() {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const step = TOUR_STEPS[stepIndex];

  useEffect(() => {
    const forced = searchParams?.get('tour') === 'admin';
    const completed = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true';
    if (forced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional initialization
      setIsOpen(true);
      setStepIndex(0);
    } else if (!completed) {
      setIsOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isOpen || !step) return;

    const updateRect = () => {
      const rect = getElementCenter(step.targetSelector);
      setTargetRect(rect);
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    const id = setInterval(updateRect, 500);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      clearInterval(id);
    };
  }, [isOpen, step]);

  const closeTour = useCallback(() => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, []);

  const goNext = useCallback(() => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      closeTour();
    }
  }, [stepIndex, closeTour]);

  const goPrev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  if (!isOpen || !step) return null;

  const progress = ((stepIndex + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop with spotlight cutout */}
      <div className="absolute inset-0 bg-black/40" onClick={closeTour}>
        {targetRect && (
          <div
            className="absolute rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] ring-2 ring-[hsl(var(--chart-1))] transition-all duration-300"
            style={{
              left: targetRect.x - targetRect.width / 2 - 8,
              top: targetRect.y - targetRect.height / 2 - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        className={cn(
          'absolute z-10 w-80 rounded-xl border border-border/80 bg-card/95 p-5 shadow-xl backdrop-blur-sm transition-all duration-300',
          targetRect ? 'opacity-100' : 'opacity-0'
        )}
        style={
          targetRect
            ? {
                left: Math.min(Math.max(targetRect.x - 160, 16), window.innerWidth - 336),
                top: targetRect.y + targetRect.height / 2 + 24,
              }
            : {}
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[hsl(var(--chart-1))]" />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              Step {stepIndex + 1} of {TOUR_STEPS.length}
            </span>
          </div>
          <button
            onClick={closeTour}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close tour"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-semibold">{step.title}</h3>
          <p className="text-xs leading-5 text-muted-foreground text-pretty">{step.description}</p>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[hsl(var(--chart-1))] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={goPrev}
            disabled={stepIndex === 0}
            className="h-8 gap-1 text-xs"
          >
            <ChevronLeft className="size-3" />
            Back
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={goNext}
            className="h-8 gap-1 text-xs"
          >
            {stepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
