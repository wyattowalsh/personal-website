"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Check, Circle, ArrowRight } from "lucide-react";

interface Step {
  title: string;
  description?: ReactNode;
  code?: string;
  completed?: boolean;
}

interface StepsProps {
  steps?: Step[];
  children?: ReactNode;
  variant?: "numbered" | "check" | "arrow";
  className?: string;
}

export default function Steps({
  steps,
  children,
  variant = "numbered",
  className,
}: StepsProps) {
  // If children are provided, use them directly (for MDX composition)
  if (children) {
    return (
      <div
        className={cn(
          "my-6 space-y-0",
          "[&>*]:relative",
          "[&>*:not(:last-child)]:pb-8",
          // Connecting line
          "[&>*:not(:last-child)]:before:absolute",
          "[&>*:not(:last-child)]:before:left-[15px]",
          "[&>*:not(:last-child)]:before:top-10",
          "[&>*:not(:last-child)]:before:bottom-0",
          "[&>*:not(:last-child)]:before:w-[2px]",
          "[&>*:not(:last-child)]:before:bg-border/50",
          className
        )}
      >
        {children}
      </div>
    );
  }

  // Otherwise use steps array
  if (!steps || steps.length === 0) return null;

  return (
    <div className={cn("my-6 space-y-0", className)}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={cn(
            "relative pb-8 last:pb-0",
            // Connecting line for all except last
            index < steps.length - 1 &&
              "before:absolute before:left-[15px] before:top-10 before:bottom-0 before:w-[2px] before:bg-border/50"
          )}
        >
          <div className="flex gap-4">
            {/* Step indicator */}
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full",
                "flex items-center justify-center",
                "text-sm font-semibold",
                step.completed
                  ? "bg-green-500 text-white"
                  : "bg-primary/20 text-primary"
              )}
            >
              {step.completed ? (
                <Check className="w-4 h-4" />
              ) : variant === "numbered" ? (
                index + 1
              ) : variant === "check" ? (
                <Circle className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <h4 className="font-semibold">{step.title}</h4>
              {step.description && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </div>
              )}
              {step.code && (
                <pre className="mt-3 p-3 rounded-lg bg-muted text-sm overflow-x-auto">
                  <code>{step.code}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Individual step for MDX composition
export function Step({
  title,
  number,
  completed = false,
  children,
  className,
}: {
  title: string;
  number?: number;
  completed?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-4", className)}>
      {/* Step indicator */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full",
          "flex items-center justify-center",
          "text-sm font-semibold",
          completed
            ? "bg-green-500 text-white"
            : "bg-primary/20 text-primary"
        )}
      >
        {completed ? (
          <Check className="w-4 h-4" />
        ) : number !== undefined ? (
          number
        ) : (
          <Circle className="w-4 h-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pt-0.5">
        <h4 className="font-semibold">{title}</h4>
        {children && (
          <div className="mt-2 text-sm text-muted-foreground [&>p]:mb-2 [&>p:last-child]:mb-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
