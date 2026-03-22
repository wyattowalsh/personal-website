"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { List, ChevronDown } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract headings from DOM on mount
  useEffect(() => {
    const article = document.querySelector('article');
    if (!article) return;

    const elements = article.querySelectorAll('h2[id], h3[id], h4[id]');
    const items: TocItem[] = Array.from(elements).map((el) => ({
      id: el.id,
      text: el.textContent?.trim() ?? '',
      level: parseInt(el.tagName.charAt(1), 10),
    }));

    setHeadings(items); // eslint-disable-line react-hooks/set-state-in-effect -- sync from DOM on mount
  }, []);

  // Set up Intersection Observer for scroll-spy
  useEffect(() => {
    if (headings.length < 2) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) return;

    // Track which headings are currently intersecting
    const visibleIds = new Set<string>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        }

        // Pick the first visible heading in document order
        const firstVisible = headings.find((h) => visibleIds.has(h.id));
        if (firstVisible) {
          setActiveId(firstVisible.id);
        }
      },
      {
        // Trigger when heading crosses the top ~20% of viewport
        rootMargin: '-64px 0px -75% 0px',
        threshold: 0,
      }
    );

    for (const el of headingElements) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        // Update URL hash without jumping
        window.history.replaceState(null, '', `#${id}`);
        setActiveId(id);
        setIsOpen(false);
      }
    },
    []
  );

  // Don't render if fewer than 2 headings
  if (headings.length < 2) return null;

  const indentClass = (level: number) => {
    if (level === 3) return 'pl-3';
    if (level === 4) return 'pl-6';
    return '';
  };

  const renderLink = (item: TocItem) => (
    <li key={item.id}>
      <a
        href={`#${item.id}`}
        onClick={(e) => handleClick(e, item.id)}
        className={cn(
          'block py-1 text-sm leading-relaxed transition-colors duration-200',
          indentClass(item.level),
          activeId === item.id
            ? 'text-primary font-medium'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {item.text}
      </a>
    </li>
  );

  return (
    <>
      {/* Mobile / Tablet: collapsible disclosure */}
      <div className="xl:hidden mb-6">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg border border-border',
            'bg-muted/50 px-4 py-3 text-sm font-medium text-foreground',
            'transition-colors hover:bg-muted'
          )}
          aria-expanded={isOpen}
          aria-controls="toc-nav-mobile"
        >
          <List className="size-4 shrink-0" />
          <span>On this page</span>
          <ChevronDown
            className={cn(
              'ml-auto size-4 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>
        {isOpen && (
          <nav
            id="toc-nav-mobile"
            aria-label="Table of contents"
            className={cn(
              'mt-2 rounded-lg border border-border bg-muted/30 px-4 py-3'
            )}
          >
            <ul className="space-y-0.5 list-none pl-0">
              {headings.map(renderLink)}
            </ul>
          </nav>
        )}
      </div>

      {/* Desktop: sticky sidebar */}
      <nav
        aria-label="Table of contents"
        className={cn(
          'hidden xl:block',
          'sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto',
          'w-56 shrink-0'
        )}
      >
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          On this page
        </h3>
        <ul className="space-y-0.5 list-none border-l border-border pl-0">
          {headings.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={cn(
                  'block border-l-2 py-1 pl-3 text-sm leading-relaxed transition-colors duration-200',
                  indentClass(item.level),
                  activeId === item.id
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
                )}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
