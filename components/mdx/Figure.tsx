"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

interface FigureProps {
  src: string;
  alt: string;
  caption?: ReactNode;
  attribution?: string;
  attributionLink?: string;
  width?: number;
  height?: number;
  size?: "sm" | "md" | "lg" | "full";
  align?: "left" | "center" | "right";
  rounded?: boolean;
  shadow?: boolean;
  border?: boolean;
  className?: string;
}

export default function Figure({
  src,
  alt,
  caption,
  attribution,
  attributionLink,
  width = 800,
  height = 600,
  size = "full",
  align = "center",
  rounded = true,
  shadow = true,
  border = true,
  className,
}: FigureProps) {
  const sizeClasses = {
    sm: "max-w-xs",
    md: "max-w-md",
    lg: "max-w-2xl",
    full: "max-w-full",
  };

  const alignClasses = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  };

  return (
    <figure
      className={cn(
        "my-8",
        sizeClasses[size],
        alignClasses[align],
        className
      )}
    >
      {/* Image container */}
      <div
        className={cn(
          "relative overflow-hidden",
          rounded && "rounded-xl",
          shadow && "shadow-lg shadow-black/5 dark:shadow-black/20",
          border && "border border-border/50"
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn("w-full h-auto")}
        />
      </div>

      {/* Caption and attribution */}
      {(caption || attribution) && (
        <figcaption
          className={cn(
            "mt-3 text-sm text-center",
            "text-muted-foreground"
          )}
        >
          {caption && <span className="block">{caption}</span>}
          
          {attribution && (
            <span className="block text-xs mt-1 opacity-70">
              {attributionLink ? (
                <a
                  href={attributionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  {attribution}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                attribution
              )}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}

// Figure group for side-by-side images
export function FigureGroup({
  children,
  columns = 2,
  caption,
  className,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  caption?: ReactNode;
  className?: string;
}) {
  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  };

  return (
    <figure className={cn("my-8", className)}>
      <div
        className={cn(
          "grid gap-4",
          columnClasses[columns],
          "[&>*]:my-0" // Remove individual figure margins
        )}
      >
        {children}
      </div>
      
      {caption && (
        <figcaption className="mt-3 text-sm text-center text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
