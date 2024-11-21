"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import TagLink from "@/components/TagLink";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: {
    slug: string;
    title?: string;
    summary?: string;
    date?: string;
    updated?: string;
    tags?: string[];
    image?: string;
    readingTime?: string;
  };
}

const PostCard = ({ post, className }: PostCardProps) => {
  const {
    slug,
    title = "Untitled Post",
    summary = "No summary available.",
    date,
    updated,
    tags = [],
    image = "/logo.webp",
    readingTime = "A few minutes",
  } = post;

  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn("transition-transform duration-300 h-full", className)} // Add h-full class
    >
      <Link href={`/blog/posts/${slug}`}>
        <Card
          className="overflow-hidden bg-card hover:shadow-2xl transition-shadow duration-300 cursor-pointer rounded-xl transform hover:scale-105 h-full" // Add h-full class
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative h-56"> {/* Set fixed height for image container */}
            <Image
              src={image}
              alt={title}
              width={400}
              height={250}
              className="w-full h-full object-cover transition-transform duration-500 rounded-t-xl" // Set height to full
              placeholder="blur"
              blurDataURL="/placeholder.png"
            />
            {isHovered && (
              <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300"></div>
            )}
          </div>
          <div className="p-4 flex flex-col flex-grow bg-gradient-to-b from-card to-muted rounded-b-xl h-full"> {/* Add h-full class */}
            <div className="flex flex-row items-center gap-4 mb-2">
              <h3 className="text-xl font-semibold text-foreground leading-tight flex-grow">
                {title}
              </h3>
              <Separator orientation="vertical" className="h-6" />
              <p className="text-xs text-muted-foreground whitespace-nowrap">⏱️ {readingTime}</p>
            </div>
            <Separator className="my-2" />
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {summary}
            </p>
            <Separator className="my-2" />
            <div className="text-xs text-muted-foreground mb-4 flex flex-row justify-between items-center">
              {date && (
                <p>
                  Published: {formatDate(date, "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
              {updated && (
                <p>
                  Updated: {formatDate(updated, "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
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
