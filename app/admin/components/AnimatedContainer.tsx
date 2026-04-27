'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedContainerProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  animation?: 'fade' | 'slide' | 'scale' | 'fade-slide';
}

export function AnimatedContainer({
  children,
  delay = 0,
  className,
  animation = 'fade',
}: AnimatedContainerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animationClasses = {
    fade: 'opacity-0 data-[visible=true]:opacity-100',
    slide: 'translate-y-4 opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100',
    scale: 'scale-95 opacity-0 data-[visible=true]:scale-100 data-[visible=true]:opacity-100',
    'fade-slide': 'translate-y-2 opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100',
  };

  return (
    <div
      ref={ref}
      data-visible={isVisible}
      className={cn(
        'transition-all duration-500 ease-out',
        animationClasses[animation],
        className
      )}
    >
      {children}
    </div>
  );
}
