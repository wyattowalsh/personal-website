// mdx-components.tsx

import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { EquationContext } from "@/components/PostLayout";

// Import shadcn/ui components
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip } from "@/components/ui/tooltip";

// Custom components and hooks
import GistWrapper from "@/components/GistWrapper";
import ClientSideLink from "@/components/ClientSideLink";
import TagLink from "@/components/TagLink";
import Math from "@/components/Math";

import React from "react";

// Update or add the GistWrapper props type definition
type GistWrapperProps = {
  url: string;
};

let equationCounter = 0;

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Root wrapper for prose content
    wrapper: ({ children }) => (
      <div
        className={cn(
          "prose prose-lg max-w-none",
          "dark:prose-invert",
          "prose-headings:scroll-m-20 prose-headings:tracking-tight",
          "prose-pre:p-0 prose-pre:bg-transparent",
          "prose-img:rounded-lg prose-img:shadow-md",
          "dark:prose-img:shadow-gray-900/30",
          "text-gray-900 dark:text-gray-100"
        )}
      >
        {children}
      </div>
    ),

    // Headings with distinct styles for light and dark modes
    h1: ({ children }) => (
      <h1
        className={cn(
          "text-4xl sm:text-5xl md:text-6xl font-bold",
          "mt-8 mb-4",
          "text-gray-900 dark:text-gray-100",
          "tracking-tight",
          "leading-tight",
          "transition-colors duration-300",
          "hover:text-primary dark:hover:text-primary-light"
        )}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        className={cn(
          "text-3xl sm:text-4xl md:text-5xl font-semibold",
          "mt-6 mb-3",
          "text-gray-900 dark:text-gray-100",
          "tracking-tight",
          "leading-tight",
          "transition-colors duration-300",
          "hover:text-primary dark:hover:text-primary-light"
        )}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className={cn(
          "text-2xl sm:text-3xl md:text-4xl font-semibold",
          "mt-5 mb-2",
          "text-gray-900 dark:text-gray-100",
          "tracking-tight",
          "leading-tight"
        )}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        className={cn(
          "text-xl sm:text-2xl md:text-3xl font-semibold",
          "mt-4 mb-2",
          "text-gray-900 dark:text-gray-100",
          "tracking-tight",
          "leading-tight"
        )}
      >
        {children}
      </h4>
    ),

    // Math component with legible text in dark mode
    Math: ({ children, display }) => {
      const isDisplayMath = display || children.includes('\\begin{equation}');
      const equationContext = React.useContext(EquationContext);
      const equationNumber = isDisplayMath ? (equationContext.increment(), equationContext.count) : undefined;
      
      return (
        <div className="my-8 not-prose w-full">
          <div
            className={cn(
              "relative w-full",
              "px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10",
              "bg-gray-50 dark:bg-gray-800",
              "rounded-lg shadow-lg dark:shadow-gray-900/50",
              "transition-shadow duration-200 hover:shadow-xl",
              "text-gray-900 dark:text-gray-100",
              "overflow-x-auto" // Add this line
            )}
          >
            <div className="min-w-full w-fit mx-auto"> {/* Add this wrapper */}
              <Math 
                display={isDisplayMath} 
                number={equationNumber}
                id={equationNumber ? `equation-${equationNumber}` : undefined}
              >
                {children}
              </Math>
            </div>
          </div>
        </div>
      );
    },

    // Code blocks with enhanced contrast and responsiveness
    pre: ({ children, className, ...props }) => (
      <div className="not-prose my-8">
        <pre
          className={cn(
            "relative rounded-lg overflow-auto",
            "p-4 sm:p-6 md:p-8 lg:p-10",
            "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
            "shadow-lg dark:shadow-gray-900/50",
            "transition-shadow duration-200 hover:shadow-xl",
            "text-sm sm:text-base md:text-lg lg:text-xl",
            "scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700",
            className
          )}
          {...props}
        >
          {children}
        </pre>
      </div>
    ),

    // Images with responsive and lazy loading
    img: (props: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) => (
      <div className="my-8 not-prose">
        <Image
          {...props}
          alt={props.alt || ""}
          className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          layout="responsive"
          width={700}
          height={475}
        />
        {props.alt && (
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {props.alt}
          </p>
        )}
      </div>
    ),

    // Custom components marked as not-prose
    Gist: ({ url }: GistWrapperProps) => (
      <div className="not-prose my-8">
        <GistWrapper url={url} />
      </div>
    ),

    // Strong text with improved readability
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900 dark:text-gray-100">
        {children}
      </strong>
    ),

    // Paragraphs with explicit text color and responsive line-height
    p: ({ children }) => (
      <p className="my-4 leading-relaxed sm:leading-loose text-gray-900 dark:text-gray-100">
        {children}
      </p>
    ),

    // Links with styles for light and dark modes
    a: ({ href, children, className }) => {
      if (!href) return <span>{children}</span>;
      const isExternal = href.startsWith("http") || href.startsWith("//");
      const LinkComponent = isExternal ? ClientSideLink : Link;
      return (
        <LinkComponent
          href={href}
          className={cn(
            "text-blue-600 hover:text-blue-800",
            "dark:text-blue-400 dark:hover:text-blue-500",
            className?.includes('no-underline') ? 'no-underline' : 'underline',
          )}
        >
          {children}
        </LinkComponent>
      );
    },

    // Inline code with improved contrast and styling
    code: ({ children }) => (
      <code
        className={cn(
          "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100",
          "rounded px-1.5 py-0.5",
          "font-mono text-sm"
        )}
      >
        {children}
      </code>
    ),

    // Blockquote with enhanced legibility and styling
    blockquote: ({ children }) => (
      <blockquote
        className={cn(
          "border-l-4 pl-4 italic",
          "border-gray-300 text-gray-700",
          "dark:border-gray-600 dark:text-gray-200",
          "my-6",
          "bg-gray-50 dark:bg-gray-900",
          "rounded-md"
        )}
      >
        {children}
      </blockquote>
    ),

    // List styling with explicit text color and spacing
    ul: ({ children }) => (
      <ul className="list-disc list-inside ml-4 my-4 space-y-2 text-gray-900 dark:text-gray-100">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside ml-4 my-4 space-y-2 text-gray-900 dark:text-gray-100">
        {children}
      </ol>
    ),

    // Include other custom components
    Alert,
    Badge,
    Button,
    Card,
    Tooltip,
    Separator,
    ClientSideLink,
    TagLink,
    ...components,
  };
}
