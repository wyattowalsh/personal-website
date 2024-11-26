// app/blog/layout.tsx

import React from "react";
import BlogTitle from "@/components/BlogTitle";

export default function BlogRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <BlogTitle />
      <hr className="border-border my-4" />
      <main className="container mx-auto px-4">
        {children}
      </main>
    </div>
  );
}
