"use client";

import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface SpoilerProps {
  children: ReactNode;
  label?: string;
  blur?: boolean;
  className?: string;
}

export default function Spoiler({
  children,
  label = "Reveal spoiler",
  blur = true,
  className,
}: SpoilerProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className={cn("my-4 relative", className)}>
      {/* Content */}
      <div
        className={cn(
          "p-4 rounded-xl",
          "border border-border/50",
          "bg-card/30",
          "transition-all duration-300",
          !isRevealed && blur && "select-none",
          !isRevealed && blur && "[&>*]:blur-md [&>*]:opacity-50"
        )}
        aria-hidden={!isRevealed}
      >
        {children}
      </div>

      {/* Overlay button */}
      {!isRevealed && (
        <button
          onClick={() => setIsRevealed(true)}
          className={cn(
            "absolute inset-0",
            "flex items-center justify-center",
            "bg-transparent",
            "group cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
          )}
          aria-label={label}
        >
          <span
            className={cn(
              "inline-flex items-center gap-2",
              "px-4 py-2 rounded-full",
              "bg-background/80 backdrop-blur-sm",
              "border border-border/50",
              "text-sm font-medium",
              "shadow-lg",
              "transition-all duration-300",
              "group-hover:bg-primary group-hover:text-primary-foreground",
              "group-hover:border-primary"
            )}
          >
            <Eye className="w-4 h-4" />
            {label}
          </span>
        </button>
      )}

      {/* Hide button */}
      {isRevealed && (
        <button
          onClick={() => setIsRevealed(false)}
          className={cn(
            "absolute top-2 right-2",
            "p-1.5 rounded-full",
            "bg-muted/80 backdrop-blur-sm",
            "text-muted-foreground hover:text-foreground",
            "transition-colors duration-200"
          )}
          aria-label="Hide spoiler"
        >
          <EyeOff className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Inline spoiler variant
export function InlineSpoiler({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <button
      onClick={() => setIsRevealed(!isRevealed)}
      className={cn(
        "inline px-1.5 py-0.5 rounded",
        "transition-all duration-200",
        isRevealed
          ? "bg-transparent"
          : "bg-muted-foreground/20 text-transparent hover:bg-muted-foreground/30",
        className
      )}
      aria-label={isRevealed ? "Hide" : "Reveal"}
    >
      <span className={cn(!isRevealed && "invisible")}>{children}</span>
    </button>
  );
}
