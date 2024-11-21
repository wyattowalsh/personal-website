"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import type { AdjacentPost } from '@/lib/posts';

export default function PostPagination() {
  const [state, setState] = useState<{
    data: { prevPost?: AdjacentPost; nextPost?: AdjacentPost };
    isLoading: boolean;
    error: string | null;
  }>({
    data: {},
    isLoading: true,
    error: null,
  });

  const pathname = usePathname();

  useEffect(() => {
    const controller = new AbortController();

    const fetchAdjacentPosts = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const slug = pathname.split('/blog/posts/')[1];
        if (!slug) return;

        const response = await fetch(`/api/blog/posts/adjacent?slug=${slug}`, {
          signal: controller.signal,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setState(prev => ({ ...prev, data, isLoading: false }));
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load navigation',
        }));
      }
    };

    fetchAdjacentPosts();
    return () => controller.abort();
  }, [pathname]);

  if (state.error) {
    return <div className="text-destructive text-center my-8">{state.error}</div>;
  }

  const { prevPost, nextPost } = state.data;

  return (
    (<nav className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8" aria-label="Post navigation">
      {prevPost ? (
        <Link href={`/blog/posts/${prevPost.slug}`} className="md:mr-auto">
          <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
            <Card className="p-4 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <ChevronLeft className="w-5 h-5" />
              <div>
                <p className="text-sm text-muted-foreground">Previous</p>
                <p className="font-medium line-clamp-1">{prevPost.title}</p>
              </div>
            </Card>
          </motion.div>
        </Link>
      ) : (
        (<div />) // Empty div to maintain grid layout
      )}
      {nextPost ? (
        <Link href={`/blog/posts/${nextPost.slug}`} className="md:ml-auto">
          <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
            <Card className="p-4 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm text-muted-foreground">Next</p>
                <p className="font-medium line-clamp-1">{nextPost.title}</p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </Card>
          </motion.div>
        </Link>
      ) : (
        (<div />) // Empty div to maintain grid layout
      )}
    </nav>)
  );
}
