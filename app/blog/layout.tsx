// app/blog/layout.tsx
import React from "react";
import BlogTitle from "@/components/BlogTitle";
import BlogFooter from "@/components/BlogFooter";
import ScrollReset from "@/components/ScrollReset";
import { Metadata } from "next";

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
      <main className="container mx-auto flex-grow">
        <BlogTitle />
        <hr className="border-border my-4" />
          {children}
        <BlogFooter />
      </main>
    </div>
  );
}
