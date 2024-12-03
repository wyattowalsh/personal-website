"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { links } from './Links';
import { RssIcon, FileJson, AtomIcon } from 'lucide-react';

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link 
    href={href}
    className={cn(
      "text-sm text-muted-foreground/90 no-underline",
      "hover:text-primary transition-colors duration-200",
      "hover:scale-105 transform-gpu",
      "focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
    )}
  >
    {children}
  </Link>
);

const FeedLink = ({ href, icon: Icon, children }: { 
  href: string; 
  icon: React.ElementType;
  children: React.ReactNode 
}) => (
  <Link 
    href={href}
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

const BlogFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn(
      "w-full py-6", // Reduced padding
      "mt-12", // Reduced margin
      "bg-gradient-to-b from-background to-muted/30",
      "border-t border-border/50"
    )}>
      <div className="container mx-auto px-4 max-w-6xl"> {/* Added max-width */}
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-3",
          "gap-6 md:gap-4", // Tighter gaps
          "items-center", // Center all columns vertically
          "min-h-[200px]" // Ensure minimum height for content
        )}>
          {/* Logo Section */}
          <div className={cn(
            "flex flex-col items-center md:items-center", // Center in both mobile and desktop
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
            "flex flex-col",
            "items-center", // Center horizontally
            "justify-center", // Center vertically
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
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/blog/tags">Tags</FooterLink>
            </nav>
          </div>

          {/* Connect Section */}
          <div className={cn(
            "flex flex-col",
            "items-center", // Center horizontally
            "justify-center", // Center vertically
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
                  <FooterLink key={link.name} href={link.url}>
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
