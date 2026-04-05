"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { formatDate, isDifferentDate, cn } from "@/lib/utils";
import Image from "next/image";
import type { PostMetadata } from "@/lib/types";
import { Calendar, Clock, Tag, Edit } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import ThemeAwareHero, { getHeroConfig } from "@/components/heroes/ThemeAwareHero";
import RisoHero from "@/components/heroes/RisoHero";
import { TagPill } from "@/components/ui/tag-pill";

interface PostHeaderProps {
  post: PostMetadata;
}

interface MetadataItemProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  dateTime?: string;
  label?: string;
}

function MetadataItem({ icon, children, dateTime, label }: MetadataItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 group",
        "hover:text-primary transition-all duration-300"
      )}
      aria-label={label}
    >
      <span className={cn(
        "transition-transform duration-300",
        "group-hover:scale-110"
      )}>
        {icon}
      </span>
      {dateTime ? (
        <time dateTime={dateTime} className="font-medium">
          {children}
        </time>
      ) : (
        <span className="font-medium">{children}</span>
      )}
    </div>
  );
}

interface MetadataTagsProps {
  tags: string[];
}

function MetadataTags({ tags }: MetadataTagsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 group",
        "hover:text-primary transition-all duration-300"
      )}
      aria-label="Post tags"
    >
      <span className={cn(
        "transition-transform duration-300",
        "group-hover:scale-110"
      )}>
        <Tag className="h-5 w-5" />
      </span>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {tags.map((tag) => (
          <TagPill
            key={tag}
            tag={tag}
            href={`/blog/tags/${tag}`}
            className="pointer-events-auto"
          />
        ))}
      </div>
    </div>
  );
}

export function PostHeader({ post }: PostHeaderProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const imageSrc = post.image || "/logo.webp";
  const isSvg = imageSrc.endsWith(".svg");
  const heroConfig = getHeroConfig(imageSrc);
  const altText = post.image
    ? `Header image for ${post.title}`
    : "Default post header image";

  return (
    <motion.header
      className={cn(
        "relative overflow-hidden",
        "rounded-xl md:rounded-2xl lg:rounded-3xl",
        "max-w-5xl mx-auto",
        "border border-post-header-border",
        "mt-0 pt-0",
        "bg-gradient-to-br from-post-header-gradient-from via-post-header-gradient-via to-post-header-gradient-to",
        "backdrop-blur-sm backdrop-saturate-150",
        "shadow-post-header",
        "transition-all duration-500 ease-out",
        "hover:shadow-post-header-hover hover:scale-[1.01]",
        "dark:from-post-header-gradient-from/90",
        "dark:via-post-header-gradient-via/90",
        "dark:to-post-header-gradient-to/90",
        "dark:border-post-header-border/50"
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      role="banner"
      aria-label="Post header"
    >
      <div className={cn(
        "relative w-full",
        "aspect-[21/9] sm:aspect-[2/1] md:aspect-[21/9]",
        "overflow-hidden",
        "rounded-t-xl md:rounded-t-2xl lg:rounded-t-3xl",
        "pt-0 mt-0"
      )}>
        {imageSrc === "/riso-hero.svg" ? (
          <RisoHero
            className={cn(
              "absolute inset-0 w-full h-full",
              "transform transition-all duration-700",
              !imageLoaded && "blur-sm scale-105",
              imageLoaded && "blur-0 scale-100",
              "hover:scale-105 transition-transform duration-700"
            )}
            onLoad={handleImageLoad}
          />
        ) : heroConfig ? (
          <ThemeAwareHero
            config={heroConfig}
            className={cn(
              "absolute inset-0 w-full h-full",
              "transform transition-all duration-700",
              !imageLoaded && "blur-sm scale-105",
              imageLoaded && "blur-0 scale-100",
              "hover:scale-105 transition-transform duration-700"
            )}
            onLoad={handleImageLoad}
          />
        ) : isSvg ? (
          /* eslint-disable-next-line @next/next/no-img-element -- post hero image uses external URL not compatible with next/image */
          <img
            src={imageSrc}
            alt={altText}
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              "transform transition-all duration-700",
              !imageLoaded && "blur-sm scale-105",
              imageLoaded && "blur-0 scale-100",
              "hover:scale-105 transition-transform duration-700",
              "mt-0 pt-0"
            )}
            onLoad={handleImageLoad}
          />
        ) : (
          <Image
            src={imageSrc}
            alt={altText}
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
            className={cn(
              "object-cover w-full h-full",
              "transform transition-all duration-700",
              !imageLoaded && "blur-sm scale-105",
              imageLoaded && "blur-0 scale-100",
              "hover:scale-105 transition-transform duration-700",
              "mt-0 pt-0"
            )}
            onLoad={handleImageLoad}
          />
        )}

        <div className={cn(
          "absolute inset-0",
          "bg-gradient-to-b",
          "from-black/30 via-black/40 to-black/60",
          "z-10",
          "transition-opacity duration-300",
          "opacity-60 hover:opacity-40"
        )} />

        {post.caption && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "absolute bottom-3 sm:bottom-4 md:bottom-6",
              "left-3 sm:left-4 md:left-6",
              "right-3 sm:right-4 md:right-6",
              "md:right-auto",
              "max-w-[95%] sm:max-w-[85%] md:max-w-[75%]",
              "z-20",
              "text-xs sm:text-sm md:text-base",
              "italic font-medium",
              "leading-relaxed",
              "line-clamp-2 sm:line-clamp-3",
              "px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5",
              "rounded-md sm:rounded-lg",
              "bg-caption-bg",
              "text-caption-fg",
              "backdrop-blur-md",
              "border border-caption-border",
              "shadow-sm sm:shadow-md lg:shadow-lg",
              "transition-all duration-300",
              "hover:bg-caption-hover-bg",
              "hover:text-caption-hover-fg",
              "hover:scale-[1.02] active:scale-[0.98]",
              "hover:border-caption-hover-border"
            )}
          >
            {post.caption}
          </motion.p>
        )}
      </div>

      <div className={cn(
        "relative z-10",
        "p-4 sm:p-6 lg:p-8",
        "space-y-4 sm:space-y-6 lg:space-y-8"
      )}>
        <motion.h1
          className={cn(
            "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
            "font-extrabold tracking-tight",
            "bg-gradient-heading bg-clip-text text-transparent",
            "leading-tight",
            "transition-colors duration-300"
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {post.title}
        </motion.h1>

        <Separator className="my-4" />

        {post.summary && (
          <p className={cn(
            "text-base sm:text-lg lg:text-xl",
            "text-muted-foreground",
            "leading-relaxed",
            "max-w-prose"
          )}>
            {post.summary}
          </p>
        )}

        <div className={cn(
          "flex flex-wrap gap-3 sm:gap-4 lg:gap-6",
          "text-sm sm:text-base",
          "text-muted-foreground",
          "border-t border-b border-border-muted",
          "py-3 sm:py-4",
          "transition-colors duration-300"
        )}>
          <MetadataItem
            icon={<Calendar className="h-5 w-5" />}
            dateTime={post.created}
            label="Post creation date"
          >
            {formatDate(post.created)}
          </MetadataItem>

          {post.readingTime && (
            <MetadataItem
              icon={<Clock className="h-5 w-5" />}
              label="Estimated reading time"
            >
              {post.readingTime}
            </MetadataItem>
          )}

          {post.updated && isDifferentDate(post.updated, post.created) && (
            <MetadataItem
              icon={<Edit className="h-5 w-5" />}
              dateTime={post.updated}
              label="Last updated date"
            >
              <span className="flex items-center gap-1">
                {formatDate(post.updated)}
                <span className="text-muted-foreground/60">(Updated)</span>
              </span>
            </MetadataItem>
          )}

          {post.tags.length > 0 && (
            <MetadataTags tags={post.tags} />
          )}
        </div>
      </div>
    </motion.header>
  );
}
