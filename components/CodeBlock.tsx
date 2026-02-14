"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  children: React.ReactNode;
}

export function CodeBlock({ children }: CodeBlockProps) {
  const handleCopy = () => {
    let text = '';
    if (typeof children === 'string') {
      text = children;
    } else if (React.isValidElement(children)) {
      const childProps = children.props as { children?: React.ReactNode };
      text = childProps?.children?.toString() || '';
    }
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={cn(
      "relative my-8 rounded-xl overflow-hidden group",
      "bg-muted/30 dark:bg-card/50",
      "border border-border/50 dark:border-border/30",
      "transition-all duration-300",
      "hover:shadow-lg dark:hover:shadow-primary/10",
      "before:content-[''] before:absolute before:inset-0",
      "before:bg-gradient-to-r before:from-primary/5 before:to-transparent",
      "before:opacity-0 hover:before:opacity-100",
      "before:transition-opacity before:duration-300"
    )}>
      <div className="absolute top-3 right-3 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          className={cn(
            "opacity-0 group-hover:opacity-100",
            "transition-all duration-300",
            "bg-background/80 dark:bg-background/50",
            "hover:bg-background dark:hover:bg-background/70",
            "backdrop-blur-sm",
            "shadow-sm hover:shadow-md",
            "transform hover:scale-105",
            "border border-border/50"
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
  );
}
