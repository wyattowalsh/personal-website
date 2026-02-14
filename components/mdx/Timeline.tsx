"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Circle, Clock, Star, Zap, Flag, Rocket, Code, Bug, Sparkles } from "lucide-react";

type TimelineItemStatus = "completed" | "current" | "upcoming";

interface TimelineItem {
  date: string;
  title: string;
  description?: string;
  status?: TimelineItemStatus;
  icon?: "check" | "clock" | "star" | "zap" | "flag" | "rocket" | "code" | "bug" | "sparkles";
  tags?: string[];
}

interface TimelineProps {
  items: TimelineItem[];
  title?: string;
  className?: string;
}

const ICONS = {
  check: CheckCircle,
  clock: Clock,
  star: Star,
  zap: Zap,
  flag: Flag,
  rocket: Rocket,
  code: Code,
  bug: Bug,
  sparkles: Sparkles,
};

const STATUS_STYLES = {
  completed: {
    dot: "bg-green-500 border-green-500",
    line: "bg-green-500",
    icon: "text-green-500",
    card: "border-green-500/30 bg-green-500/5",
  },
  current: {
    dot: "bg-primary border-primary animate-pulse",
    line: "bg-gradient-to-b from-primary to-muted",
    icon: "text-primary",
    card: "border-primary/30 bg-primary/5",
  },
  upcoming: {
    dot: "bg-muted border-muted-foreground/30",
    line: "bg-muted",
    icon: "text-muted-foreground",
    card: "border-border/50 bg-card/50",
  },
};

export default function Timeline({ items, title, className }: TimelineProps) {
  return (
    <div className={cn("my-8", className)}>
      {title && (
        <h3 className="text-xl font-semibold mb-6">{title}</h3>
      )}
      
      <div className="relative">
        {items.map((item, index) => {
          const status = item.status || (index === 0 ? "current" : "upcoming");
          const styles = STATUS_STYLES[status];
          const Icon = item.icon ? ICONS[item.icon] : Circle;
          const isLast = index === items.length - 1;

          return (
            <div key={index} className="relative pl-8 pb-8 last:pb-0">
              {/* Vertical line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[11px] top-6 w-0.5 h-[calc(100%-24px)]",
                    styles.line
                  )}
                />
              )}

              {/* Dot/Icon */}
              <div
                className={cn(
                  "absolute left-0 top-1 w-6 h-6 rounded-full",
                  "flex items-center justify-center",
                  "border-2 transition-all duration-300",
                  styles.dot
                )}
              >
                {item.icon && (
                  <Icon className={cn("w-3 h-3", styles.icon)} />
                )}
              </div>

              {/* Content card */}
              <div
                className={cn(
                  "p-4 rounded-xl border",
                  "transition-all duration-300",
                  "hover:shadow-md",
                  styles.card
                )}
              >
                {/* Date */}
                <time className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {item.date}
                </time>

                {/* Title */}
                <h4 className="text-lg font-semibold mt-1">{item.title}</h4>

                {/* Description */}
                {item.description && (
                  <p className="text-muted-foreground mt-2 text-sm">
                    {item.description}
                  </p>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {item.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className={cn(
                          "px-2 py-0.5 text-xs rounded-full",
                          "bg-muted text-muted-foreground"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
