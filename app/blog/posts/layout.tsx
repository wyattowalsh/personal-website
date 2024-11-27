"use client";

import React, { Suspense, useEffect } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostLayout } from "@/components/PostLayout";
import { MathProvider } from "@/components/MathContext";

type Props = {
  params: { slug: string }
  children: React.ReactNode
}

function PostContent({ children }: { children: React.ReactNode }) {
  // Add hydration marker
  useEffect(() => {
    document.documentElement.setAttribute('data-math-hydrated', 'true');
  }, []);

  return <>{children}</>;
}

export default function PostsLayout({ children }: Props) {
  return (
    <div className="relative">
      <div className="max-w-7xl lg:max-w-[80rem] xl:max-w-[90rem] 2xl:max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Suspense fallback={<LoadingSpinner />}>
          <PostLayout>
            <PostContent>{children}</PostContent>
          </PostLayout>
        </Suspense>
      </div>
    </div>
  );
}