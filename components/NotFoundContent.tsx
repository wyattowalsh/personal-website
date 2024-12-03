"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, BookOpen, ArrowLeft } from "lucide-react";

export default function NotFoundContent() {
  const pathname = usePathname();
  const isBlogPage = pathname.startsWith("/blog");
  const backLink = isBlogPage ? "/blog" : "/";

  return (
    <div className={cn(
      "text-center space-y-8 p-8",
      "backdrop-blur-sm bg-background/30",
      "rounded-xl border border-border/50",
      "shadow-lg hover:shadow-xl",
      "transition-all duration-500",
      "relative z-10",
      "group"
    )}>
      {/* Animated border gradient */}
      <div className={cn(
        "absolute inset-0 rounded-xl",
        "bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50",
        "opacity-0 group-hover:opacity-100",
        "transition-opacity duration-500",
        "-z-10 blur-xl"
      )} />

      {/* 404 heading with glitch effect */}
      <h1 className={cn(
        "text-8xl font-bold",
        "bg-gradient-heading bg-clip-text text-transparent",
        "animate-glitch-text",
        "relative",
        "after:content-['404'] after:absolute after:inset-0",
        "after:bg-gradient-heading after:bg-clip-text after:text-transparent",
        "after:translate-x-[2px] after:translate-y-[2px]",
        "after:opacity-70"
      )}>
        404
      </h1>

      {/* Subheading with gradient */}
      <h2 className={cn(
        "text-3xl font-semibold",
        "bg-gradient-text bg-clip-text text-transparent",
        "animate-gradient"
      )}>
        {isBlogPage ? "Blog Post Not Found" : "Page Not Found"}
      </h2>

      {/* Description with animated fade-in */}
      <p className={cn(
        "text-lg text-muted-foreground",
        "max-w-md mx-auto",
        "animate-fadeIn opacity-0",
        "group-hover:text-foreground transition-colors"
      )}>
        {isBlogPage
          ? "The blog post you're looking for doesn't exist or has been moved."
          : "The page you're looking for doesn't exist or has been moved."}
      </p>

      {/* Enhanced button with icon */}
      <div className="pt-4">
        <Button
          asChild
          variant="default"
          className={cn(
            "group/button relative overflow-hidden",
            "bg-gradient-to-r from-primary to-secondary",
            "hover:from-secondary hover:to-primary",
            "transition-all duration-500",
            "shadow-lg hover:shadow-xl",
            "scale-100 hover:scale-105",
            "animate-float"
          )}
        >
          <Link href={backLink} className="no-underline">
            <span className="flex items-center gap-2">
            <ArrowLeft className={cn(
                "w-4 h-4 transition-transform duration-300",
                "group-hover/button:-translate-x-1"
              )} />
              <span>{isBlogPage ? "Back to blog" : "Go back home"}</span>
              
              {isBlogPage ? <BookOpen className="w-4 h-4" /> : <Home className="w-4 h-4" />}
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
