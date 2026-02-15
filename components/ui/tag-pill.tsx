// components/ui/tag-pill.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Route } from "next";

export interface TagPillProps {
  tag: string;
  href?: string;
  variant?: "default" | "active" | "interactive";
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  asChild?: boolean;
}

const TagPill = React.forwardRef<HTMLElement, TagPillProps>(
  ({ tag, href, variant = "default", onClick, className, asChild = false }, ref) => {
    const baseStyles = cn(
      // Base styles
      "inline-flex items-center",
      "text-xs sm:text-sm font-medium",
      "px-2 py-0.5 sm:px-2.5 sm:py-1",
      "rounded-full",
      "border transition-all duration-200",
      "no-underline",
      "transform-gpu hover:scale-[1.02] active:scale-[0.98]",

      // Light mode styles
      "bg-white/50 hover:bg-primary/10",
      "text-muted-foreground hover:text-primary",
      "border-muted-foreground/20 hover:border-primary/50",

      // Dark mode styles
      "dark:bg-white/5 dark:hover:bg-primary/20",
      "dark:text-muted-foreground dark:hover:text-primary-light",
      "dark:border-muted-foreground/10 dark:hover:border-primary/40",

      // Shadow effects
      "shadow-sm hover:shadow-md",
      "dark:shadow-none dark:hover:shadow-primary/20",

      // Focus styles
      "focus:outline-none focus:ring-2 focus:ring-primary/40",
      "dark:focus:ring-primary/40",

      // Variant-specific overrides
      variant === "active" && [
        "bg-primary/10 dark:bg-primary/20",
        "text-primary dark:text-primary-light",
        "border-primary/50 dark:border-primary/50",
      ],

      className
    );

    const content = `#${tag}`;

    if (href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href as Route}
          onClick={onClick}
          className={baseStyles}
        >
          {content}
        </Link>
      );
    }

    if (onClick) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          onClick={onClick}
          className={baseStyles}
          type="button"
        >
          {content}
        </button>
      );
    }

    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={baseStyles}
      >
        {content}
      </span>
    );
  }
);

TagPill.displayName = "TagPill";

export { TagPill };
