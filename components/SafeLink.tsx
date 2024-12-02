"use client";

import React from 'react';
import Link from 'next/link';
import type { Route } from 'next';

interface SafeLinkProps {
  href: Route | URL;
  className?: string;
  children: React.ReactNode;
}

export default function SafeLink({ href, className, children }: SafeLinkProps) {
  // Check if we're already inside a link
  const isNestedLink = React.useCallback(() => {
    if (typeof document === 'undefined') return false;
    let element = document.activeElement;
    while (element) {
      if (element.tagName === 'A') return true;
      element = element.parentElement as HTMLElement;
    }
    return false;
  }, []);

  // If nested, just render the children without the link
  if (isNestedLink()) {
    return <>{children}</>;
  }

  // Otherwise render the full link
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}