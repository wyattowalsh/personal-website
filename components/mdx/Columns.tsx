"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ColumnsProps {
  children: ReactNode;
  count?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
  divider?: boolean;
  className?: string;
}

export default function Columns({
  children,
  count = 2,
  gap = "md",
  align = "start",
  divider = false,
  className,
}: ColumnsProps) {
  const columnClasses = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  return (
    <div
      className={cn(
        "my-6 grid grid-cols-1",
        columnClasses[count],
        gapClasses[gap],
        alignClasses[align],
        divider && "[&>*]:border-l [&>*]:border-border/30 [&>*:first-child]:border-l-0 [&>*]:pl-6 [&>*:first-child]:pl-0",
        className
      )}
    >
      {children}
    </div>
  );
}

// Individual column with optional sticky behavior
export function Column({
  children,
  sticky = false,
  className,
}: {
  children: ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        sticky && "md:sticky md:top-24",
        className
      )}
    >
      {children}
    </div>
  );
}

// 50/50 split with optional reverse
export function Split({
  children,
  reverse = false,
  gap = "md",
  align = "center",
  className,
}: {
  children: ReactNode;
  reverse?: boolean;
  gap?: "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
  className?: string;
}) {
  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  return (
    <div
      className={cn(
        "my-6 grid grid-cols-1 md:grid-cols-2",
        gapClasses[gap],
        alignClasses[align],
        reverse && "md:[&>*:first-child]:order-2",
        className
      )}
    >
      {children}
    </div>
  );
}
