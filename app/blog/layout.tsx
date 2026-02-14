// app/blog/layout.tsx
import React from "react";
import BlogFooter from "@/components/BlogFooter";
import ScrollReset from "@/components/ScrollReset";
import { Metadata } from "next";
import { cn } from "@/lib/utils";
import { BlogLayoutContent } from "@/components/BlogLayoutContent";

export const metadata: Metadata = {
  title: {
    default: "onelonedatum Blog",
    template: "%s | onelonedatum Blog"
  },
  description: "Explore articles about software development, web technologies, and technical insights",
  openGraph: {
    title: "onelonedatum Blog",
    description: "Explore articles about software development, web technologies, and technical insights",
  },
  twitter: {
    title: "onelonedatum Blog"
  }
};

export default function BlogRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <ScrollReset />
      <main className={cn(
        "container mx-auto flex-grow",
        "pt-8 sm:pt-12 md:pt-16"
      )}>
        <BlogLayoutContent>
          {children}
        </BlogLayoutContent>
        <BlogFooter />
      </main>
    </div>
  );
}
