'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

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
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        timerRef.current = setTimeout(() => {
          setIsVisible(true);
        }, delay);
      } else if (!once) {
        setIsVisible(false);
      }
    },
    [delay, once]
  );

  useEffect(() => {
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
  }, [handleIntersect, threshold]);

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
      data-visible={isVisible}
      className={cn(
        'transition-all will-change-transform',
        animationClasses[animation],
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
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
  const [value, setValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!isVisible) return;

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
  }, [isVisible, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{formatter(value)}{suffix}
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
    <span className={className} aria-label={text}>
      {text.split('').map((char, index) => (
        <AnimatedContainer
          key={index}
          delay={delay + index * charDelay}
          animation="fade"
          duration={400}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </AnimatedContainer>
      ))}
    </span>
  );
}
