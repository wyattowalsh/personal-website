"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Info, Lightbulb, AlertTriangle, Terminal, Bookmark, Quote } from "lucide-react";

type AsideVariant = "note" | "tip" | "warning" | "terminal" | "bookmark" | "quote";

interface AsideProps {
  children: ReactNode;
  variant?: AsideVariant;
  title?: string;
  sticky?: boolean;
  position?: "left" | "right";
  className?: string;
}

const variantConfig: Record<
  AsideVariant,
  {
    icon: typeof Info;
    borderColor: string;
    bgColor: string;
    iconColor: string;
    defaultTitle: string;
  }
> = {
  note: {
    icon: Info,
    borderColor: "border-blue-500/50",
    bgColor: "bg-blue-500/5",
    iconColor: "text-blue-500",
    defaultTitle: "Note",
  },
  tip: {
    icon: Lightbulb,
    borderColor: "border-green-500/50",
    bgColor: "bg-green-500/5",
    iconColor: "text-green-500",
    defaultTitle: "Pro Tip",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "border-amber-500/50",
    bgColor: "bg-amber-500/5",
    iconColor: "text-amber-500",
    defaultTitle: "Warning",
  },
  terminal: {
    icon: Terminal,
    borderColor: "border-purple-500/50",
    bgColor: "bg-purple-500/5",
    iconColor: "text-purple-500",
    defaultTitle: "CLI",
  },
  bookmark: {
    icon: Bookmark,
    borderColor: "border-primary/50",
    bgColor: "bg-primary/5",
    iconColor: "text-primary",
    defaultTitle: "Bookmark",
  },
  quote: {
    icon: Quote,
    borderColor: "border-muted-foreground/30",
    bgColor: "bg-muted/30",
    iconColor: "text-muted-foreground",
    defaultTitle: "",
  },
};

export default function Aside({
  children,
  variant = "note",
  title,
  sticky = false,
  position = "right",
  className,
}: AsideProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const displayTitle = title ?? config.defaultTitle;

  return (
    <aside
      className={cn(
        // Base styles
        "my-6 p-4 rounded-xl",
        "border-l-4",
        config.borderColor,
        config.bgColor,
        // Sticky positioning
        sticky && "md:sticky md:top-24",
        // Float styles for sidebar effect
        position === "right" && "md:float-right md:ml-6 md:w-72 md:clear-right",
        position === "left" && "md:float-left md:mr-6 md:w-72 md:clear-left",
        className
      )}
    >
      {displayTitle && (
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("w-4 h-4", config.iconColor)} />
          <span className={cn("text-sm font-semibold", config.iconColor)}>
            {displayTitle}
          </span>
        </div>
      )}

      <div
        className={cn(
          "text-sm text-muted-foreground",
          "[&>p]:mb-2 [&>p:last-child]:mb-0",
          "[&>ul]:my-2 [&>ul]:pl-4 [&>ul]:list-disc",
          "[&>ol]:my-2 [&>ol]:pl-4 [&>ol]:list-decimal",
          variant === "quote" && "italic"
        )}
      >
        {children}
      </div>
    </aside>
  );
}

// Inline aside that sits within text flow
export function InlineAside({
  children,
  variant = "note",
  className,
}: {
  children: ReactNode;
  variant?: AsideVariant;
  className?: string;
}) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-2 py-0.5 rounded-md",
        "text-sm",
        config.bgColor,
        "border",
        config.borderColor,
        className
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", config.iconColor)} />
      <span className="text-muted-foreground">{children}</span>
    </span>
  );
}
