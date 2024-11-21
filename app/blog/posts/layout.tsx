import React from "react";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostLayout } from "@/components/PostLayout";
import Script from 'next/script';

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSpinner />}>
        <PostLayout>{children}</PostLayout>
      </Suspense>
    </div>
  );
}
