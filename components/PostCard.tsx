// components/PostCard.tsx

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import TagLink from "@/components/TagLink";
import { cn } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";

// Add the same helper function
function isDifferentDate(date1: string | undefined, date2: string | undefined): boolean {
  if (!date1 || !date2) return false;
  // Remove any milliseconds and 'Z' suffix for comparison
  const clean1 = date1.split('.')[0].replace('Z', '');
  const clean2 = date2.split('.')[0].replace('Z', '');
  return clean1 !== clean2;
}

interface PostCardProps {
  post: {
    slug: string;
    title?: string;
    summary?: string;
    created?: string;    // Changed from date
    updated?: string;    // Added
    tags?: string[];
    image?: string;
    readingTime?: string;
  };
  className?: string;
}

const PostCard = ({ post, className }: PostCardProps) => {
  const {
    slug,
    title = "Untitled Post",
    summary = "No summary available.",
    created,    // Changed from date
    updated,
    tags = [],
    image = "/logo.webp",
    readingTime = "A few minutes",
  } = post;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn("transition-transform duration-300 h-full", className)}
    >
      <Link 
        href={{
          pathname: '/blog/posts/[slug]',
          query: { slug }
        }}
        className="block h-full no-underline"
      >
        <Card className="overflow-hidden bg-card hover:shadow-glow transition-shadow duration-300 cursor-pointer rounded-xl h-full flex flex-col">
          <div className="relative aspect-video w-full">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
              placeholder="blur"
              blurDataURL="/logo.webp"
            />
            {/* Enhanced gradient overlay for better contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80"></div>
            
            {/* Card content with guaranteed contrast */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
              <h3 className={cn(
                "text-xl font-semibold leading-tight",
                "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]",
                "tracking-tight"
              )}>
                {title}
              </h3>
              <p className={cn(
                "text-sm mt-1 line-clamp-2",
                "text-gray-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]",
                "leading-relaxed"
              )}>
                {summary}
              </p>
            </div>
          </div>
          
          <div className="p-4 flex flex-col flex-grow bg-gradient-to-b from-card to-card/95">
            <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
              {created && (
                <span className={cn(
                  "flex items-center gap-2 group",
                  "text-muted-foreground/80",
                  "transition-colors duration-300",
                  "hover:text-primary"
                )}>
                  <Calendar className={cn(
                    "h-4 w-4",
                    "transition-transform duration-300",
                    "group-hover:scale-110"
                  )} />
                  <time 
                    dateTime={created} 
                    className={cn(
                      "no-underline font-medium",
                      "transition-colors duration-300"
                    )}
                  >
                    {formatDate(created)}
                  </time>
                </span>
              )}
              {readingTime && (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="no-underline">{readingTime}</span>
                </span>
              )}
            </div>
            <Separator className="my-2" />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-auto">
                {tags.map((tag) => (
                  <TagLink key={tag} tag={tag} isNested />
                ))}
              </div>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default PostCard;
