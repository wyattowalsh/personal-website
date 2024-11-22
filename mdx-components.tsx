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
import { useEquations } from './contexts/equations-context';

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
                "border-b border-border-40 dark:border-border-60",
                "pb-4",
                "bg-clip-text bg-gradient-to-r from-primary via-primary-80 to-primary",
                "hover:text-transparent transition-colors duration-300",
                "relative",
                "after:content-[''] after:absolute after:bottom-0 after:left-0",
                "after:w-0 after:h-[2px] after:bg-primary",
                "after:transition-all after:duration-300",
                "hover:after:w-full"
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
                "border-b border-border-40 dark:border-border-60",
                "pb-2",
                "relative group",
                "transition-all duration-300 ease-out",
                "hover:text-primary",
                "before:content-['#'] before:absolute before:-left-6",
                "before:text-primary before:opacity-0",
                "before:transition-opacity before:duration-300",
                "group-hover:before:opacity-100"
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
                "text-foreground dark:text-primary-foreground",
                "relative inline-block",
                "after:content-[''] after:absolute after:bottom-0 after:left-0",
                "after:w-full after:h-[1px] after:bg-primary-30",
                "after:transform after:scale-x-0 after:origin-bottom-right",
                "after:transition-transform after:duration-300",
                "hover:after:scale-x-100 hover:after:origin-bottom-left",
                "hover:text-primary transition-colors duration-300"
            )}>
                {children}
            </h3>
        ),

        p: ({ children }) => (
            <p className={cn(
                "leading-7 [&:not(:first-child)]:mt-6",
                "text-base sm:text-lg",
                "text-muted-foreground dark:text-primary-foreground-80",
                "relative group",
                "transition-all duration-300",
                "hover:text-foreground dark:hover:text-primary-foreground",
                "after:content-[''] after:absolute after:bottom-0 after:left-0",
                "after:w-full after:h-[1px] after:bg-primary-10",
                "after:transform after:scale-x-0",
                "after:transition-transform after:duration-500",
                "group-hover:after:scale-x-100"
            )}>
                {children}
            </p>
        ),

        pre: ({ children }) => (
            <div className={cn(
                "relative my-8 rounded-xl overflow-hidden group",
                "bg-muted-30 dark:bg-card-50",
                "border border-border-50 dark:border-border-30",
                "transition-all duration-300",
                "hover:shadow-lg dark:hover:shadow-primary-10",
                "before:content-[''] before:absolute before:inset-0",
                "before:bg-gradient-to-r before:from-primary/5 before:to-transparent",
                "before:opacity-0 hover:before:opacity-100",
                "before:transition-opacity before:duration-300"
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
                            "transition-all duration-300",
                            "bg-background-80 dark:bg-background-50",
                            "hover:bg-background dark:hover:bg-background-70",
                            "backdrop-blur-sm",
                            "shadow-sm hover:shadow-md",
                            "transform hover:scale-105",
                            "border border-border-50"
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
                    "bg-card-50 dark:bg-card-30",
                    "text-foreground dark:text-primary-foreground",
                    "rounded-xl",
                    "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
                    "hover:scrollbar-thumb-primary-50"
                )}>
                    {children}
                </pre>
            </div>
        ),

        table: ({ children }) => (
            <div className={cn(
                "my-8 w-full",
                "overflow-hidden rounded-xl",
                "border border-border-50",
                "bg-card-50 dark:bg-card-30",
                "transition-all duration-300",
                "hover:shadow-lg dark:hover:shadow-primary-10",
                "group"
            )}>
                <div className={cn(
                    "overflow-x-auto",
                    "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
                    "hover:scrollbar-thumb-primary-50"
                )}>
                    <table className={cn(
                        "w-full border-collapse",
                        "[&_tr:hover]:bg-muted-50 dark:[&_tr:hover]:bg-card-50",
                        "[&_tr]:transition-colors [&_tr]:duration-200",
                        "[&_th]:bg-muted-30 dark:[&_th]:bg-card-30",
                        "[&_th]:p-4 [&_td]:p-4",
                        "[&_th]:border-b [&_th]:border-border-50",
                        "[&_td]:border-b [&_td]:border-border-20",
                        "[&_th]:text-left [&_th]:font-medium",
                        "[&_th]:text-foreground dark:[&_th]:text-primary-foreground"
                    )}>
                        {children}
                    </table>
                </div>
            </div>
        ),

        

        img: ({ src, alt }) => (
            <div className={cn(
                "relative my-8 rounded-xl overflow-hidden group",
                "transition-all duration-300",
                "hover:shadow-xl dark:hover:shadow-primary-20",
                "after:absolute after:inset-0",
                "after:bg-gradient-to-t after:from-black-20 after:to-transparent",
                "after:opacity-0 group-hover:after:opacity-100",
                "after:transition-opacity after:duration-300"
            )}>
                <Image
                    src={src || ''}
                    alt={alt || ''}
                    className={cn(
                        "rounded-xl",
                        "shadow-sm dark:shadow-none",
                        "transition-all duration-500",
                        "group-hover:scale-[1.02]",
                        "group-hover:shadow-xl dark:group-hover:shadow-2xl",
                        "hover:brightness-110"
                    )}
                    width={1200}
                    height={630}
                    quality={95}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAAAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4cHRocHCIkJR8nODE+MTAxODYzQEhcTkBEV0U3Ol9kaVpZWjY+SmxdbWdlXXJ5Y2f/2wBDARUXFx4cHhocHBodHiIeIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
                {alt && (
                    <div className={cn(
                        "absolute bottom-0 left-0 right-0",
                        "p-4 text-sm text-white-90",
                        "bg-gradient-to-t from-black-60 to-transparent",
                        "transform translate-y-full",
                        "transition-transform duration-300",
                        "group-hover:translate-y-0"
                    )}>
                        {alt}
                    </div>
                )}
            </div>
        ),

        strong: ({ children }) => (
            <strong className={cn(
                "font-semibold relative",
                "text-primary dark:text-primary-foreground",
                "dark:font-medium",
                "px-1 py-0.5 rounded",
                "bg-primary/5 dark:bg-primary-10",
                "transition-all duration-300",
                "hover:bg-primary-10 dark:hover:bg-primary-20",
                "border-b border-primary-20 dark:border-primary-30",
                "hover:border-primary-40 dark:hover:border-primary-50"
            )}>
                {children}
            </strong>
        ),

        Alert: (props) => (
            <div className="my-8">
                <Alert {...props} className="dark:bg-card-30" />
            </div>
        ),

        Badge,

        Button,

        Card: (props) => (
            <div className="my-8">
                <Card {...props} className={cn(
                    props.className,
                    "dark:bg-card-30 dark:border-border-50"
                )} />
            </div>
        ),

        Tooltip,

        Separator: () => (
            <div className="my-8">
                <Separator className="dark:bg-border-50" />
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
            
            const styles = {
                info: "border-blue-500-30 bg-blue-500/5 dark:border-blue-500-20 dark:bg-blue-500-10",
                warning: "border-yellow-500-30 bg-yellow-500/5 dark:border-yellow-500-20 dark:bg-yellow-500-10",
                terminal: "border-green-500-30 bg-green-500/5 dark:border-green-500-20 dark:bg-green-500-10",
            };
            
            return (
                <div className={cn(
                    "my-6 p-4 rounded-xl",
                    "border-2",
                    styles[type as keyof typeof styles],
                    "transition-all duration-300",
                    "hover:shadow-lg dark:hover:shadow-primary-10",
                    "relative overflow-hidden group",
                    "before:content-[''] before:absolute before:inset-0",
                    "before:bg-gradient-to-r before:from-primary/5 before:to-transparent",
                    "before:opacity-0 hover:before:opacity-100",
                    "before:transition-opacity before:duration-300"
                )}>
                    <div className="flex items-start gap-4 relative z-10">
                        <Icon className={cn(
                            "w-5 h-5 mt-1 flex-shrink-0",
                            "transition-transform duration-300 group-hover:scale-110",
                            type === "info" && "text-blue-500",
                            type === "warning" && "text-yellow-500",
                            type === "terminal" && "text-green-500"
                        )} />
                        <div className="prose-sm">{children}</div>
                    </div>
                </div>
            );
        },

        // Add collapsible sections
        Accordion: (props) => (
            <Accordion
                {...props}
                className={cn(
                    "my-6",
                    "border border-border-50 rounded-xl",
                    "bg-card-50 dark:bg-card-30"
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
                    "bg-muted-50 dark:bg-muted-10",
                    "border border-border-50"
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
                    "transition-all duration-300",
                    "relative group",
                    "after:content-[''] after:absolute after:bottom-0 after:left-0",
                    "after:w-full after:h-[1px] after:bg-primary",
                    "after:transform after:scale-x-0 after:origin-bottom-right",
                    "after:transition-transform after:duration-300",
                    "hover:after:scale-x-100 hover:after:origin-bottom-left"
                )}
            >
                {children}
                <ExternalLink className={cn(
                    "w-4 h-4",
                    "transition-all duration-300",
                    "group-hover:transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                    "group-hover:scale-110"
                )} />
            </Link>
        ),

        // Add code filename header
        CodeFilename: ({ children }) => (
            <div className={cn(
                "-mb-2 rounded-t-xl border-b-0",
                "bg-muted-30 dark:bg-card-50",
                "border border-border-50",
                "px-4 py-2 text-sm",
                "font-mono",
                "flex items-center gap-2",
                "transition-all duration-300",
                "group",
                "hover:bg-muted-50 dark:hover:bg-card-70",
                "hover:border-primary-30 dark:hover:border-primary-40"
            )}>
                <span className={cn(
                    "text-muted-foreground group-hover:text-foreground",
                    "transition-colors duration-300"
                )}>
                    {children}
                </span>
                <div className={cn(
                    "flex-1 h-[1px]",
                    "bg-gradient-to-r from-border-50 to-transparent",
                    "transition-opacity duration-300",
                    "opacity-0 group-hover:opacity-100"
                )} />
            </div>
        ),

        // Add scrollable code blocks
        ScrollableCode: ({ children, maxHeight = "400px" }) => (
            <ScrollArea 
                className={cn(
                    "rounded-xl border border-border-50",
                    "bg-card-50 dark:bg-card-30",
                    "transition-all duration-300",
                    "hover:border-primary-30 dark:hover:border-primary-40",
                    "hover:shadow-lg dark:hover:shadow-primary-10",
                    "group",
                    "[&_::-webkit-scrollbar-thumb]:bg-border-40",
                    "[&_::-webkit-scrollbar-thumb]:hover:bg-primary-40",
                    "[&_::-webkit-scrollbar-track]:bg-transparent",
                    "[&_::-webkit-scrollbar]:w-2 [&_::-webkit-scrollbar]:h-2",
                    "[&_::-webkit-scrollbar-thumb]:rounded-full",
                    "[&_::-webkit-scrollbar-track]:rounded-full"
                )}
                style={{ maxHeight }}
            >
                <div className={cn(
                    "relative",
                    "before:content-[''] before:absolute before:inset-0",
                    "before:bg-gradient-to-r before:from-primary/5 before:to-transparent",
                    "before:opacity-0 group-hover:before:opacity-100",
                    "before:transition-opacity before:duration-300"
                )}>
                    {children}
                </div>
            </ScrollArea>
        ),

        // Add callout component
        Callout: ({ children, icon, type = "default" }) => {
            const Icon = icon || Info;
            const styles = {
                warning: "border-yellow-500-50 bg-yellow-500/5 text-yellow-700 dark:text-yellow-300",
                error: "border-red-500-50 bg-red-500/5 text-red-700 dark:text-red-300",
                info: "border-blue-500-50 bg-blue-500/5 text-blue-700 dark:text-blue-300",
                success: "border-green-500-50 bg-green-500/5 text-green-700 dark:text-green-300",
                default: "border-primary-50 bg-primary/5 text-primary-foreground"
            };

            return (
                <div className={cn(
                    "my-6 p-4 rounded-xl",
                    "border-2 border-l-4",
                    styles[type as keyof typeof styles],
                    "transition-all duration-300",
                    "hover:shadow-lg",
                    "group relative overflow-hidden",
                    "backdrop-blur-[2px]",
                    "before:content-[''] before:absolute before:inset-0",
                    "before:bg-gradient-to-br before:from-white/5 before:to-transparent",
                    "before:opacity-0 hover:before:opacity-100",
                    "before:transition-opacity before:duration-300"
                )}> 
                    <div className="flex items-start gap-4 relative z-10">
                        <Icon className={cn(
                            "w-5 h-5 mt-1 flex-shrink-0",
                            "transition-transform duration-300",
                            "group-hover:scale-110 group-hover:rotate-3"
                        )} />
                        <div className="flex-1 prose-sm">{children}</div>
                    </div>
                </div>
            );
        },

        // Add details/summary component
        Details: ({ children, summary }) => (
            <details className={cn(
                "my-6 rounded-xl",
                "border border-border-50",
                "bg-card-50 dark:bg-card-30",
                "group/details",
                "transition-all duration-300",
                "hover:border-primary-30 dark:hover:border-primary-40",
                "hover:shadow-lg dark:hover:shadow-primary-10"
            )}>
                <summary className={cn(
                    "px-4 py-3",
                    "cursor-pointer select-none",
                    "font-medium",
                    "transition-all duration-300",
                    "hover:bg-muted-50 dark:hover:bg-card-50",
                    "flex items-center gap-2",
                    "marker:content-[''] marker:hidden",
                    "before:content-['▸'] before:inline-block",
                    "before:transition-transform before:duration-300",
                    "before:text-primary-70",
                    "[&::-webkit-details-marker]:hidden",
                    "[[open]>&]:before:transform [[open]>&]:before:rotate-90"
                )}>
                    <span className="flex-1">{summary}</span>
                    <div className={cn(
                        "h-[1px] flex-1",
                        "bg-gradient-to-r from-border-50 to-transparent",
                        "transition-opacity duration-300",
                        "opacity-0 group-hover/details:opacity-100"
                    )} />
                </summary>
                <div className={cn(
                    "p-4 pt-2",
                    "animate-accordion-down [[open]>&]:animate-accordion-up",
                    "transition-all duration-300"
                )}>
                    {children}
                </div>
            </details>
        ),

        Math,

        ...components,
    };
}
