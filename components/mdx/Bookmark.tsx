"use client";

import { cn } from "@/lib/utils";
import { Bookmark as BookmarkIcon, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BookmarkProps {
  href: string;
  title: string;
  description?: string;
  image?: string;
  icon?: string;
  tags?: string[];
  external?: boolean;
  className?: string;
}

export default function Bookmark({
  href,
  title,
  description,
  image,
  icon,
  tags,
  external = false,
  className,
}: BookmarkProps) {
  const isExternal = external || href.startsWith("http");
  const LinkComponent = isExternal ? "a" : Link;
  const linkProps = isExternal
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };

  return (
    <LinkComponent
      {...linkProps}
      className={cn(
        "my-6 flex gap-4 p-4 rounded-xl",
        "border border-border/50",
        "bg-card/30",
        "transition-all duration-300",
        "hover:border-primary/50 hover:bg-card/50",
        "hover:shadow-lg hover:shadow-primary/5",
        "group no-underline",
        className
      )}
    >
      {/* Image or Icon */}
      {(image || icon) && (
        <div
          className={cn(
            "flex-shrink-0",
            "w-16 h-16 sm:w-20 sm:h-20",
            "rounded-lg overflow-hidden",
            "bg-muted",
            "flex items-center justify-center"
          )}
        >
          {image ? (
            <Image
              src={image}
              alt={title}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : icon ? (
            <span className="text-3xl">{icon}</span>
          ) : null}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              "font-semibold truncate",
              "group-hover:text-primary transition-colors"
            )}
          >
            {title}
          </h4>

          {isExternal ? (
            <ExternalLink
              className={cn(
                "w-4 h-4 flex-shrink-0",
                "text-muted-foreground",
                "transition-all duration-300",
                "group-hover:text-primary",
                "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              )}
            />
          ) : (
            <ArrowRight
              className={cn(
                "w-4 h-4 flex-shrink-0",
                "text-muted-foreground",
                "transition-all duration-300",
                "group-hover:text-primary",
                "group-hover:translate-x-1"
              )}
            />
          )}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
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

        {/* URL preview */}
        <p className="text-xs text-muted-foreground/70 mt-2 truncate">
          {href.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </p>
      </div>
    </LinkComponent>
  );
}

// Bookmark grid for multiple bookmarks
export function BookmarkGrid({
  children,
  columns = 2,
  className,
}: {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div
      className={cn(
        "grid gap-4 my-6",
        columnClasses[columns],
        "[&>*]:my-0", // Override individual bookmark margins
        className
      )}
    >
      {children}
    </div>
  );
}
