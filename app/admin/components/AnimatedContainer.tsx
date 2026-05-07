'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/components/hooks/useReducedMotion';

interface AnimatedContainerProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  animation?: 'fade' | 'slide' | 'scale' | 'fade-slide' | 'blur-fade' | 'flip-up';
  duration?: number;
  once?: boolean;
  threshold?: number;
}

export function AnimatedContainer({
  children,
  delay = 0,
  className,
  animation = 'fade',
  duration = 600,
  once = true,
  threshold = 0.1,
}: AnimatedContainerProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const visible = prefersReducedMotion || isVisible;
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setIsVisible(true);
        }, delay);
        return;
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      if (!once) {
        setIsVisible(false);
      }
    },
    [delay, once]
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      const fallbackTimer = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(fallbackTimer);
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin: '0px 0px -40px 0px',
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [handleIntersect, prefersReducedMotion, threshold]);

  const animationClasses = {
    fade: 'opacity-0 data-[visible=true]:opacity-100',
    slide: 'translate-y-6 opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100',
    scale: 'scale-[0.94] opacity-0 data-[visible=true]:scale-100 data-[visible=true]:opacity-100',
    'fade-slide': 'translate-y-3 opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100',
    'blur-fade': 'opacity-0 blur-[6px] data-[visible=true]:opacity-100 data-[visible=true]:blur-0',
    'flip-up': 'opacity-0 translate-y-4 rotate-x-6 data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0 data-[visible=true]:rotate-x-0',
  };

  return (
    <div
      ref={ref}
      data-visible={visible}
      className={cn(
        'transition-all motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:blur-0 motion-reduce:transition-none',
        prefersReducedMotion ? 'opacity-100 motion-reduce:transition-none' : animationClasses[animation],
        className
      )}
      style={{
        transitionDuration: prefersReducedMotion ? '0ms' : `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Staggered children animation wrapper
 */
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  baseDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 80,
  baseDelay = 0,
}: StaggerContainerProps) {
  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <AnimatedContainer
              key={index}
              delay={baseDelay + index * staggerDelay}
              animation="fade-slide"
            >
              {child}
            </AnimatedContainer>
          ))
        : children}
    </div>
  );
}

/**
 * Count-up number animation
 */
interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatter?: (value: number) => string;
}

export function CountUp({
  end,
  duration = 1500,
  prefix = '',
  suffix = '',
  className,
  formatter = (v) => Math.round(v).toLocaleString(),
}: CountUpProps) {
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [end, prefersReducedMotion]);

  useEffect(() => {
    if (!isVisible || prefersReducedMotion) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, end, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {prefix}{formatter(prefersReducedMotion ? end : value)}{suffix}
    </span>
  );
}

/**
 * Text reveal animation - characters fade in with stagger
 */
interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  charDelay?: number;
}

export function TextReveal({ text, className, delay = 0, charDelay = 20 }: TextRevealProps) {
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split('').map((char, index) => (
          <span
            key={index}
            className="inline-block opacity-0 animate-in fade-in-0 motion-reduce:opacity-100 motion-reduce:animate-none"
            style={{ animationDelay: `${delay + index * charDelay}ms`, animationDuration: '400ms', animationFillMode: 'forwards' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </span>
  );
}
