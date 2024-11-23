"use client";

import React, { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostLayout } from "@/components/PostLayout";
import { MathProvider } from "@/components/MathContext";

type Props = {
  params: { slug: string }
  children: React.ReactNode
}

const defaultMeta = {
  title: "w4w Blog",
  summary: "Personal blog covering technology, software engineering, and more.",
  date: "2023-01-01",
  tags: ["blog", "technology", "software engineering"],
  image: "/logo.webp"
};

function PostContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function PostsLayout({ children }: Props) {
  return (
    <div className="relative">
      <div className="max-w-7xl lg:max-w-[80rem] xl:max-w-[90rem] 2xl:max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <MathProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <PostLayout>
              <PostContent>{children}</PostContent>
            </PostLayout>
          </Suspense>
        </MathProvider>
      </div>
    </div>
  );
}