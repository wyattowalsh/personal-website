"use client";

import { cn } from "@/lib/utils";
import { Check, X, Minus } from "lucide-react";
import { ReactNode } from "react";

interface ComparisonItem {
  label: string;
  left: boolean | string | ReactNode;
  right: boolean | string | ReactNode;
}

interface ComparisonProps {
  leftTitle: string;
  rightTitle: string;
  items: ComparisonItem[];
  leftHighlight?: boolean;
  rightHighlight?: boolean;
  title?: string;
  className?: string;
}

interface ComparisonCardProps {
  title: string;
  pros?: string[];
  cons?: string[];
  features?: string[];
  price?: string;
  highlighted?: boolean;
  badge?: string;
  className?: string;
  children?: ReactNode;
}

// Simple comparison table
export default function Comparison({
  leftTitle,
  rightTitle,
  items,
  leftHighlight = false,
  rightHighlight = false,
  title,
  className,
}: ComparisonProps) {
  const renderValue = (value: boolean | string | ReactNode) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-500" />
      ) : (
        <X className="w-5 h-5 text-red-500" />
      );
    }
    if (value === null || value === undefined) {
      return <Minus className="w-5 h-5 text-muted-foreground" />;
    }
    return value;
  };

  return (
    <div className={cn("my-8", className)}>
      {title && (
        <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left font-medium text-muted-foreground border-b border-border/50" />
              <th
                className={cn(
                  "p-3 text-center font-semibold border-b",
                  leftHighlight
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "border-border/50"
                )}
              >
                {leftTitle}
              </th>
              <th
                className={cn(
                  "p-3 text-center font-semibold border-b",
                  rightHighlight
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "border-border/50"
                )}
              >
                {rightTitle}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-muted/50 transition-colors"
              >
                <td className="p-3 font-medium border-b border-border/30">
                  {item.label}
                </td>
                <td
                  className={cn(
                    "p-3 text-center border-b border-border/30",
                    leftHighlight && "bg-primary/5"
                  )}
                >
                  <div className="flex justify-center">
                    {renderValue(item.left)}
                  </div>
                </td>
                <td
                  className={cn(
                    "p-3 text-center border-b border-border/30",
                    rightHighlight && "bg-primary/5"
                  )}
                >
                  <div className="flex justify-center">
                    {renderValue(item.right)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Comparison card for side-by-side display
export function ComparisonCard({
  title,
  pros,
  cons,
  features,
  price,
  highlighted = false,
  badge,
  className,
  children,
}: ComparisonCardProps) {
  return (
    <div
      className={cn(
        "relative p-6 rounded-xl border",
        "transition-all duration-300",
        highlighted
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border/50 bg-card/50 hover:border-border",
        className
      )}
    >
      {badge && (
        <span
          className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2",
            "px-3 py-1 text-xs font-medium rounded-full",
            highlighted
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {badge}
        </span>
      )}

      <h4 className="text-xl font-semibold text-center mb-2">{title}</h4>

      {price && (
        <p className="text-2xl font-bold text-center text-primary mb-4">
          {price}
        </p>
      )}

      {features && features.length > 0 && (
        <ul className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      {pros && pros.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-green-500 mb-2">Pros</h5>
          <ul className="space-y-1">
            {pros.map((pro, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {cons && cons.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-red-500 mb-2">Cons</h5>
          <ul className="space-y-1">
            {cons.map((con, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {children}
    </div>
  );
}

// VS badge component
export function VsBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        "w-12 h-12 rounded-full",
        "bg-muted border-2 border-border",
        "text-lg font-bold text-muted-foreground",
        className
      )}
    >
      VS
    </div>
  );
}
