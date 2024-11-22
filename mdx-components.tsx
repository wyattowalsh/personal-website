import React, { useState } from "react";
import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Copy, Check, ExternalLink, Info, AlertCircle, Terminal } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip } from "@/components/ui/tooltip";

import GistWrapper from "@/components/GistWrapper";
import ClientSideLink from "@/components/ClientSideLink";
import TagLink from "@/components/TagLink";
import Math from "@/components/Math";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

type GistWrapperProps = {
    url: string;
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        wrapper: ({ children }) => (
            <div className="prose prose-lg md:prose-xl lg:prose-2xl max-w-[90ch] lg:max-w-[100ch] xl:max-w-[110ch] 2xl:max-w-[120ch] mx-auto">
                <article className="relative w-full max-w-none">
                    {children}
                </article>
            </div>
        ),

        h1: ({ children }) => (
            <h1 className={cn(
                "scroll-m-20",
                "text-3xl font-display font-bold tracking-tight",
                "sm:text-4xl md:text-5xl lg:text-6xl",
                "mt-8 mb-4",
                "text-foreground dark:text-primary-foreground",
                "border-b border-border/40 dark:border-border/60",
                "pb-4"
            )}>
                {children}
            </h1>
        ),

        h2: ({ children }) => (
            <h2 className={cn(
                "scroll-m-20", 
                "text-2xl font-display font-semibold tracking-tight",
                "sm:text-3xl md:text-4xl lg:text-5xl",
                "mt-10 mb-4",
                "text-foreground dark:text-primary-foreground",
                "border-b border-border/40 dark:border-border/60",
                "pb-2"
            )}>
                {children}  
            </h2>
        ),

        h3: ({ children }) => (
            <h3 className={cn(
                "scroll-m-20",
                "text-xl font-display font-semibold tracking-tight",
                "sm:text-2xl md:text-3xl",
                "mt-8 mb-4",
                "text-foreground dark:text-primary-foreground"
            )}>
                {children}
            </h3>
        ),

        p: ({ children }) => (
            <p className={cn(
                "leading-7 [&:not(:first-child)]:mt-6",
                "text-base sm:text-lg",
                "text-muted-foreground dark:text-primary-foreground/80"
            )}>
                {children}
            </p>
        ),

        pre: ({ children }) => (
            <div className={cn(
                "relative my-8 rounded-xl overflow-hidden group",
                "bg-muted/30 dark:bg-card/50",
                "border border-border/50 dark:border-border/30"
            )}>
                <div className="absolute top-3 right-3 z-10">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            navigator.clipboard.writeText(children?.toString() || '');
                        }}
                        className={cn(
                            "opacity-0 group-hover:opacity-100",
                            "transition-all duration-200",
                            "bg-background/80 dark:bg-background/50",
                            "hover:bg-background dark:hover:bg-background/70",
                            "backdrop-blur-sm"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <Copy className="h-4 w-4" />
                            <span className="hidden sm:inline">Copy</span>
                        </span>
                    </Button>
                </div>
                <pre className={cn(
                    "p-4 overflow-x-auto",
                    "bg-card/50 dark:bg-card/30",
                    "text-foreground dark:text-primary-foreground",
                    "rounded-xl"
                )}>
                    {children}
                </pre>
            </div>
        ),

        table: ({ children }) => (
            <div className={cn(
                "my-8 w-full",
                "overflow-x-auto rounded-xl",
                "border border-border/50",
                "bg-card/50 dark:bg-card/30"
            )}>
                <table className="w-full border-collapse">
                    {children}
                </table>
            </div>
        ),

        blockquote: ({ children }) => (
            <blockquote className={cn(
                "mt-6 border-l-4 border-primary/60",
                "pl-6 italic",
                "text-muted-foreground dark:text-primary-foreground/80",
                "bg-muted/50 dark:bg-muted/10",
                "py-4 rounded-r-xl"
            )}>
                {children}
            </blockquote>
        ),

        img: ({ src, alt }) => (
            <div className="relative my-8 rounded-xl overflow-hidden group">
                <Image
                    src={src || ''}
                    alt={alt || ''}
                    className={cn(
                        "rounded-xl",
                        "shadow-sm dark:shadow-none",
                        "transition-all duration-300",
                        "group-hover:scale-[1.02]",
                        "group-hover:shadow-xl dark:group-hover:shadow-2xl"
                    )}
                    width={1200}
                    height={630}
                    quality={90}
                />
            </div>
        ),

        strong: ({ children }) => (
            <strong className={cn(
                "font-semibold",
                "text-primary dark:text-primary-foreground",
                "dark:font-medium"
            )}>
                {children}
            </strong>
        ),

        Alert: (props) => (
            <div className="my-8">
                <Alert {...props} className="dark:bg-card/30" />
            </div>
        ),

        Badge,

        Button,

        Card: (props) => (
            <div className="my-8">
                <Card {...props} className={cn(
                    props.className,
                    "dark:bg-card/30 dark:border-border/50"
                )} />
            </div>
        ),

        Tooltip,

        Separator: () => (
            <div className="my-8">
                <Separator className="dark:bg-border/50" />
            </div>
        ),

        ClientSideLink,

        TagLink,

        Gist: ({ url }: GistWrapperProps) => (
            <div className="my-8 not-prose">
                <GistWrapper url={url} />
            </div>
        ),

        // Add specialized note/warning blocks
        Note: ({ children, type = "info" }) => {
            const icons = {
                info: Info,
                warning: AlertCircle,
                terminal: Terminal,
            };
            const Icon = icons[type as keyof typeof icons];
            
            return (
                <div className={cn(
                    "my-6 p-4 rounded-xl",
                    "border border-border/50",
                    "bg-card/50 dark:bg-card/30",
                    "flex items-start gap-4"
                )}>
                    <Icon className="w-5 h-5 mt-1 flex-shrink-0 text-primary" />
                    <div>{children}</div>
                </div>
            );
        },

        // Add collapsible sections
        Accordion: (props) => (
            <Accordion
                {...props}
                className={cn(
                    "my-6",
                    "border border-border/50 rounded-xl",
                    "bg-card/50 dark:bg-card/30"
                )}
            />
        ),
        AccordionItem,
        AccordionTrigger,
        AccordionContent,

        // Add tabs
        Tabs: (props) => (
            <Tabs
                {...props}
                className="my-6"
            />
        ),
        TabsList: (props) => (
            <TabsList
                {...props}
                className={cn(
                    "bg-muted/50 dark:bg-muted/10",
                    "border border-border/50"
                )}
            />
        ),
        TabsTrigger,
        TabsContent,

        // Add external link with icon
        ExternalLink: ({ href, children }) => (
            <Link
                href={href || ''}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    "inline-flex items-center gap-1",
                    "text-primary hover:text-primary-foreground",
                    "transition-colors duration-200"
                )}
            >
                {children}
                <ExternalLink className="w-4 h-4" />
            </Link>
        ),

        // Add code filename header
        CodeFilename: ({ children }) => (
            <div className={cn(
                "-mb-2 rounded-t-xl border-b-0",
                "bg-muted/30 dark:bg-card/50",
                "border border-border/50",
                "px-4 py-2 text-sm text-muted-foreground",
                "font-mono"
            )}>
                {children}
            </div>
        ),

        // Add scrollable code blocks
        ScrollableCode: ({ children, maxHeight = "400px" }) => (
            <ScrollArea 
                className={cn(
                    "rounded-xl border border-border/50",
                    "bg-card/50 dark:bg-card/30"
                )}
                style={{ maxHeight }}
            >
                {children}
            </ScrollArea>
        ),

        // Add callout component
        Callout: ({ children, icon, type = "default" }) => {
            const Icon = icon || Info;
            return (
                <div className={cn(
                    "my-6 p-4 rounded-xl",
                    "border-l-4",
                    "bg-card/50 dark:bg-card/30",
                    type === "warning" && "border-l-yellow-500",
                    type === "error" && "border-l-red-500",
                    type === "info" && "border-l-blue-500",
                    type === "success" && "border-l-green-500",
                    type === "default" && "border-l-primary"
                )}> 
                    <div className="flex items-start gap-4">
                        <Icon className="w-5 h-5 mt-1 flex-shrink-0" />
                        <div>{children}</div>
                    </div>
                </div>
            );
        },

        // Add details/summary component
        Details: ({ children, summary }) => (
            <details className={cn(
                "my-6 rounded-xl",
                "border border-border/50",
                "bg-card/50 dark:bg-card/30",
                "group"
            )}>
                <summary className={cn(
                    "px-4 py-3",
                    "cursor-pointer select-none",
                    "font-medium",
                    "hover:bg-muted/50 dark:hover:bg-card/50"
                )}>
                    {summary}
                </summary>
                <div className="p-4 pt-0">
                    {children}
                </div>
            </details>
        ),

        Math: ({ children }) => (
            <Math>{children}</Math>
        ),

        ...components,
    };
}
