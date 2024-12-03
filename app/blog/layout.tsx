// app/blog/layout.tsx
import React from "react";
import BlogTitle from "@/components/BlogTitle";
import BlogFooter from "@/components/BlogFooter";
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
    <div className="min-h-screen flex flex-col">
      <BlogTitle />
      <hr className="border-border my-4" />
      <main className="container mx-auto flex-grow">
        {children}
      </main>
      <BlogFooter />
    </div>
  );
}
