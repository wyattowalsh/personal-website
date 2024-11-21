"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import PostHeader from "@/components/PostHeader";
import type { PostMetadata } from "@/lib/posts";

export default function ClientPostHeader() {
  const [state, setState] = useState<{
    post: PostMetadata | null;
    isLoading: boolean;
    error: string | null;
  }>({
    post: null,
    isLoading: true,
    error: null
  });

  const params = useParams();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchPost = async () => {
      if (!params.slug) return;

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const slug = Array.isArray(params.slug) 
          ? params.slug.join('/') 
          : params.slug;
          
        const response = await fetch(`/api/blog/posts/${slug}`, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid post data received');
        }

        if (isMounted) {
          setState(prev => ({ 
            ...prev, 
            post: data as PostMetadata, 
            isLoading: false 
          }));
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to load post';
          
        console.error('Error loading post:', errorMessage);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            error: errorMessage,
            isLoading: false
          }));
        }
      }
    };

    fetchPost();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [params.slug]);

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="text-destructive text-center p-4">
        {state.error}
      </div>
    );
  }

  if (!state.post) {
    return (
      <div className="text-destructive text-center p-4">
        Post not found
      </div>
    );
  }

  return <PostHeader post={state.post} />;
}
