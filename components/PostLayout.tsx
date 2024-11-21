import React, { Suspense } from "react";
import ClientPostHeader from "@/components/ClientPostHeader";
import PostPagination from "@/components/PostPagination";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article className="space-y-8">
      <ClientPostHeader />
      <div className="prose prose-lg dark:prose-invert max-w-none">
        {children}
      </div>
      <PostPagination />
    </article>
  );
}
