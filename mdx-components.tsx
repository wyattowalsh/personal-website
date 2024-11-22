import React from "react";
import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Import components
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip } from "@/components/ui/tooltip";

// Custom components
import GistWrapper from "@/components/GistWrapper";
import ClientSideLink from "@/components/ClientSideLink";
import TagLink from "@/components/TagLink";
import Math from "@/components/Math";

type GistWrapperProps = {
  url: string;
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Root wrapper with improved spacing and responsive design
    wrapper: ({ children }) => (
      <div
        className={cn(
          // Base prose styles with better spacing
          "prose prose-lg md:prose-xl max-w-none w-full",
          "px-4 sm:px-6 md:px-8",
          "mx-auto my-8",
          
          // Dark mode support
          "dark:prose-invert",
          
          // Typography improvements
          "prose-headings:scroll-m-20",
          "prose-headings:font-display",
          "prose-headings:tracking-tight",
          "prose-headings:gradient-heading",
          "prose-headings:mb-4",
          
          // Paragraph spacing
          "prose-p:my-4",
          "prose-p:leading-relaxed",
          
          // List styling
          "prose-ul:my-6",
          "prose-ol:my-6",
          "prose-li:my-2",
          
          // Code blocks
          "prose-pre:p-0",
          "prose-pre:bg-transparent",
          "prose-pre:overflow-x-auto",
          "prose-pre:scrollbar-thin",
          "prose-pre:scrollbar-thumb-muted",
          
          // Images
          "prose-img:rounded-xl",
          "prose-img:shadow-soft",
          "prose-img:my-8",
          "dark:prose-img:shadow-gray-900/30",
          "prose-img:transition-all",
          "prose-img:duration-300",
          "hover:prose-img:shadow-glow",
          
          // Links
          "prose-a:text-primary",
          "prose-a:transition-colors",
          "prose-a:duration-200",
          "hover:prose-a:text-primary/80",
          
          // Blockquotes
          "prose-blockquote:border-l-4",
          "prose-blockquote:border-primary",
          "prose-blockquote:bg-muted/50",
          "prose-blockquote:py-2",
          "prose-blockquote:px-6",
          "prose-blockquote:rounded-r-lg",
          
          // Tables
          "prose-table:w-full",
          "prose-th:bg-muted",
          "prose-th:p-2",
          "prose-td:p-2",
          "prose-td:border-muted",
          
          // Base text color
          "text-foreground"
        )}
      >
        {children}
      </div>
    ),

    // Math component with improved container
    Math: ({ children, display }) => (
      <div className={cn(
        "my-4",
        display && "py-6 px-4 bg-card rounded-xl shadow-soft"
      )}>
        <Math display={display}>{children}</Math>
      </div>
    ),

    // Enhanced heading styles
    h1: ({ children }) => (
      <h1 className={cn(
        "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
        "font-bold font-display",
        "mt-8 mb-4",
        "tracking-tight",
        "leading-tight",
        "gradient-heading",
        "animate-gradient"
      )}>
        {children}
      </h1>
    ),

    h2: ({ children }) => (
      <h2 className={cn(
        "text-2xl sm:text-3xl md:text-4xl",
        "font-bold font-display",
        "mt-8 mb-4",
        "tracking-tight",
        "gradient-heading",
        "border-b",
        "border-border",
        "pb-2"
      )}>
        {children}
      </h2>
    ),

    // Code blocks with better styling
    pre: ({ children }) => (
      <div className="my-8 not-prose">
        <pre className={cn(
          "p-4 rounded-xl",
          "bg-card text-card-foreground",
          "shadow-soft dark:shadow-gray-900/30",
          "overflow-x-auto",
          "transition-all duration-300",
          "hover:shadow-glow"
        )}>
          {children}
        </pre>
      </div>
    ),

    // Inline code with improved visibility
    code: ({ children }) => (
      <code className={cn(
        "px-1.5 py-0.5",
        "text-sm sm:text-base",
        "font-mono",
        "bg-muted",
        "text-primary",
        "rounded-md",
        "border",
        "border-border",
        "transition-colors duration-200"
      )}>
        {children}
      </code>
    ),

    // Enhanced link styling
    a: ({ children, href }) => (
      <Link 
        href={href || '#'} 
        className={cn(
          "inline-flex items-center gap-1",
          "text-primary hover:text-primary/80",
          "transition-colors duration-200",
          "no-underline hover:underline"
        )}
      >
        {children}
      </Link>
    ),

    // Other components with proper styling
    Alert: (props) => (
      <div className="my-8">
        <Alert {...props} />
      </div>
    ),
    Badge,
    Button,
    Card: (props) => (
      <div className="my-8">
        <Card {...props} />
      </div>
    ),
    Tooltip,
    Separator: () => (
      <div className="my-8">
        <Separator />
      </div>
    ),
    ClientSideLink,
    TagLink,
    Gist: ({ url }: GistWrapperProps) => (
      <div className="my-8 not-prose">
        <GistWrapper url={url} />
      </div>
    ),
    
    ...components,
  };
}
