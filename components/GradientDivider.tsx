// components/GradientDivider.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface GradientDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const GradientDivider = React.forwardRef<HTMLDivElement, GradientDividerProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={cn(
          "shrink-0",
          "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
          "dark:from-gray-500 dark:via-gray-600 dark:to-gray-700",
          "rounded-full",
          "animate-gradient",
          orientation === "horizontal" ? "h-[4px] w-full my-8" : "h-full w-[4px] mx-8",
          className
        )}
        {...props}
      />
    );
  }
);

GradientDivider.displayName = "GradientDivider";

export { GradientDivider };
