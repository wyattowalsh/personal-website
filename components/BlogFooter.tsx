"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type Route } from 'next';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { links, type Href } from './Links';  // Single import for links and Href
import { RssIcon, FileJson, AtomIcon, HomeIcon, BookOpenIcon, TagIcon } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Remove duplicate Href type definition

// Utility function to check if a URL is external
const isExternal = (url: string): boolean => /^https?:\/\//.test(url) || url.startsWith('mailto:');

// Update FooterLink component
const FooterLink = ({ href, icon: Icon, children }: { 
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => {
  const external = isExternal(href);
  const linkProps = {
    className: cn(
      "text-sm text-muted-foreground/90 no-underline",
      "hover:text-primary transition-colors duration-200",
      "hover:scale-105 transform-gpu",
      "focus:outline-none focus:ring-2 focus:ring-primary/50 rounded",
      "flex items-center gap-2"
    )
  };

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...linkProps}>
        <Icon className="w-4 h-4" />
        {children}
      </a>
    );
  } else {
    return (
      <Link href={href as Route} {...linkProps}>
        <Icon className="w-4 h-4" />
        {children}
      </Link>
    );
  }
};

// Update FeedLink component
const FeedLink = ({ href, icon: Icon, children }: { 
  href: string;
  icon: React.ElementType;
  children: React.ReactNode 
}) => (
  <Link 
    href={href as Route}
    className={cn(
      "text-sm text-muted-foreground/90 no-underline",
      "hover:text-primary transition-colors duration-200",
      "hover:scale-105 transform-gpu",
      "focus:outline-none focus:ring-2 focus:ring-primary/50 rounded",
      "flex items-center gap-2"
    )}
  >
    <Icon className="w-4 h-4" />
    {children}
  </Link>
);

// Add type definitions for dynamic link components
type LinkComponentProps = {
  href: Route;
  className: string;
  children: React.ReactNode;
};

type AnchorComponentProps = {
  href: string;
  className: string;
  target: string;
  rel: string;
  children: React.ReactNode;
};

// Update FeedFormatButton component with proper typing
const FeedFormatButton = ({ href, icon: Icon, format, description }: {
  href: string;
  icon: React.ElementType;
  format: string;
  description: string;
}) => {
  const external = isExternal(href);
  const commonProps = {
    className: cn(
      "group relative isolate",
      "inline-flex items-center gap-2.5 px-5 py-2.5",
      "rounded-xl border-2",
      "font-medium tracking-wide",
      "text-sm leading-none",
      "font-sans antialiased",
      "text-foreground/80 dark:text-foreground/70",
      "border-border/30",
      "bg-card/80 backdrop-blur-sm",
      "dark:border-border/20 dark:bg-card/60",
      "hover:text-primary dark:hover:text-primary-light",
      "hover:bg-accent/5 dark:hover:bg-accent/10",
      "hover:border-primary/30 dark:hover:border-primary/40",
      "shadow-sm hover:shadow-md",
      "dark:shadow-none dark:hover:shadow-primary/20",
      "transition-all duration-300 ease-out"
    ),
    children: (
      <>
        <Icon className={cn(
          "w-4 h-4",
          "text-muted-foreground",
          "group-hover:text-primary dark:group-hover:text-primary-light",
          "transition-colors duration-300"
        )} />
        <span className="relative">
          {format}
          <span className={cn(
            "absolute inset-x-0 -bottom-px h-px",
            "bg-gradient-to-r from-primary/50 to-accent/50",
            "scale-x-0 group-hover:scale-x-100",
            "transition-transform duration-300",
            "origin-left"
          )} />
        </span>
      </>
    )
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {external ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            {...commonProps}
          />
        ) : (
          <Link href={href as Route} {...commonProps} />
        )}
      </TooltipTrigger>
      <TooltipContent
        className={cn(
          "px-3 py-1.5",
          "bg-popover/95 backdrop-blur-sm",
          "border border-border/50",
          "shadow-lg dark:shadow-primary/20",
          "text-popover-foreground",
          "dark:bg-popover/90",
          "animate-in fade-in-0 zoom-in-95",
          "data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0",
          "data-[state=closed]:zoom-out-95"
        )}
        sideOffset={8}
      >
        <p className="text-sm font-medium leading-none">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const BlogFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("w-full py-4", "bg-gradient-to-b from-background to-muted/30", "border-t border-border/50")}>
      {/* Add subscription section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "w-full max-w-2xl",
          "mx-auto px-4 sm:px-6",
          "flex flex-col items-center justify-start",
        )}
      >
        <h2 className={cn(
          "text-lg sm:text-xl md:text-2xl",
          "font-display font-semibold",
          "bg-clip-text text-transparent",
          "bg-gradient-heading",
          "tracking-tight leading-tight",
          "text-center",
          "drop-shadow-sm dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.1)]"
        )}>
          Subscribe to Updates
        </h2>
        <div className={cn(
          "flex flex-wrap justify-center items-center",
          "gap-2 md:gap-4",
        )}>
          <FeedFormatButton
            href="/feed.xml"
            icon={RssIcon}
            format="RSS"
            description="Traditional RSS feed format"
          />
          <FeedFormatButton
            href="/feed.atom"
            icon={AtomIcon}
            format="Atom"
            description="Modern Atom feed format"
          />
          <FeedFormatButton
            href="/feed.json"
            icon={FileJson}
            format="JSON"
            description="JSON Feed for programmatic access"
          />
        </div>
        <Separator />
      </motion.div>


      <div className="container mx-auto px-4 max-w-6xl"> {/* Added max-width */}
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-3",
          "gap-6 md:gap-4", // Tighter gaps
          "items-center", // Center all columns vertically
          "min-h-[200px]" // Ensure minimum height for content
        )}>
          {/* Logo Section */}
          <div className={cn(
            "h-full flex flex-col items-center md:items-center justify-center", // Center in both mobile and desktop
            "justify-center", // Center vertically
            "space-y-3" // Reduced spacing
          )}>
            <motion.div 
              className={cn(
                "relative w-12 h-12", // Smaller logo
                "transform-gpu hover:scale-110",
                "transition-transform duration-300"
              )}
              whileHover={{ 
                rotate: [0, -5, 5, -5, 0],
                transition: { duration: 0.5 }
              }}
            >
              <Image
                src="/old.webp"
                alt="Blog Logo"
                width={48} // Smaller size
                height={48} // Smaller size
                className={cn(
                  "rounded-full",
                  "border border-primary/20", // Thinner border
                  "shadow-sm shadow-primary/10", // Subtle shadow
                  "hover:border-primary/40 transition-colors duration-300"
                )}
              />
            </motion.div>
            <p className={cn(
              "text-xs text-muted-foreground/80", // Smaller, less prominent text
              "max-w-[180px]", // Narrower width
              "text-center" // Center text always
            )}>
              Exploring the intersection of technology and creativity
            </p>
          </div>

          {/* Quick Links */}
          <div className={cn(
            "flex flex-col h-full",
            "items-center", // Center horizontally
            "justify-start", // Center vertically
            "space-y-2" // Tighter spacing
          )}>
            <h3 className={cn(
              "text-base font-semibold mb-1", // Smaller heading, less bottom margin
              "bg-gradient-text bg-clip-text text-transparent",
              "text-center" // Center heading
            )}>
              Quick Links
            </h3>
            <nav className={cn(
              "flex flex-col space-y-1", // Tighter nav spacing
              "items-center" // Center nav items
            )}>
              <FooterLink href="/" icon={HomeIcon}>Home</FooterLink>
              <FooterLink href="/blog" icon={BookOpenIcon}>Blog</FooterLink>
              <FooterLink href="/blog/tags" icon={TagIcon}>Tags</FooterLink>
            </nav>
          </div>

          {/* Connect Section */}
          <div className={cn(
            "flex flex-col h-full",
            "items-center", // Center horizontally
            "justify-start", // Center vertically
            "space-y-2" // Tighter spacing
          )}>
            <h3 className={cn(
              "text-base font-semibold mb-1", // Smaller heading, less bottom margin
              "bg-gradient-text bg-clip-text text-transparent",
              "text-center" // Center heading
            )}>
              Connect
            </h3>
            <nav className={cn(
              "flex flex-col space-y-1", // Tighter nav spacing
              "items-center" // Center nav items
            )}>
              {links
                .filter((link) => ['GitHub', 'X'].includes(link.name))
                .map((link) => (
                  <FooterLink 
                    key={link.name} 
                    href={link.url}
                    // Use the icon from the links array
                    icon={() => <FontAwesomeIcon icon={link.icon} className="w-4 h-4" />}
                  >
                    {link.name}
                  </FooterLink>
                ))}
              <div className="flex flex-col gap-1 items-center">
                <FeedLink href="/feed.xml" icon={RssIcon}>RSS</FeedLink>
                <FeedLink href="/feed.atom" icon={AtomIcon}>Atom</FeedLink>
                <FeedLink href="/feed.json" icon={FileJson}>JSON</FeedLink>
              </div>
            </nav>
          </div>
        </div>

        {/* Copyright - Centered */}
        <div className={cn(
          "mt-6 pt-3", // Reduced spacing
          "border-t border-border/20", // Lighter border
          "text-center text-xs text-muted-foreground/70", // Smaller, less prominent text
          "flex items-center justify-center" // Center copyright content
        )}>
          <p>© {currentYear} onelonedatum. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default BlogFooter;
