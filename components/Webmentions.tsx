"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Heart, Repeat, MessageCircle, Globe } from 'lucide-react';

interface Webmention {
  type: string;  // 'entry'
  'wm-property': string;  // 'like-of', 'repost-of', 'in-reply-to', 'mention-of'
  author?: {
    name: string;
    photo?: string;
    url?: string;
  };
  url: string;
  published?: string;
  content?: { text?: string; html?: string };
}

interface WebmentionResponse {
  type: string;
  name: string;
  children: Webmention[];
}

export function Webmentions() {
  const pathname = usePathname();
  const [mentions, setMentions] = useState<Webmention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    // Build target URL from pathname
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://w4w.dev';
    const targetUrl = `${siteUrl}${pathname}`;

    // Check sessionStorage cache first
    const cacheKey = `webmentions:${pathname}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        setMentions(JSON.parse(cached));
        setIsLoading(false);
        return;
      } catch { /* fall through to fetch */ }
    }

    fetch(`https://webmention.io/api/mentions.jf2?target=${encodeURIComponent(targetUrl)}&per-page=50`, { signal: controller.signal })
      .then(r => r.json())
      .then((data: WebmentionResponse) => {
        const items = data.children || [];
        setMentions(items);
        sessionStorage.setItem(cacheKey, JSON.stringify(items));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(true);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [pathname]);

  // Don't render if no mentions and not loading
  if (!isLoading && mentions.length === 0) return null;
  if (error) return null; // Fail silently

  // Group by type
  const likes = mentions.filter(m => m['wm-property'] === 'like-of');
  const reposts = mentions.filter(m => m['wm-property'] === 'repost-of');
  const replies = mentions.filter(m => m['wm-property'] === 'in-reply-to');

  return (
    <section className="my-8 max-w-5xl mx-auto">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Globe className="h-5 w-5 text-primary" />
        Webmentions
      </h3>

      {/* Counts row */}
      <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
        {likes.length > 0 && (
          <span className="flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-red-400" />
            {likes.length} {likes.length === 1 ? 'like' : 'likes'}
          </span>
        )}
        {reposts.length > 0 && (
          <span className="flex items-center gap-1.5">
            <Repeat className="h-4 w-4 text-green-400" />
            {reposts.length} {reposts.length === 1 ? 'repost' : 'reposts'}
          </span>
        )}
        {replies.length > 0 && (
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4 text-blue-400" />
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </span>
        )}
      </div>

      {/* Like avatars */}
      {likes.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {likes.slice(0, 20).map((m, i) => (
            m.author?.photo ? (
              <a key={i} href={m.author.url || m.url} target="_blank" rel="noopener noreferrer"
                 title={m.author.name}>
                <Image src={m.author.photo} alt={m.author.name}
                     width={32} height={32} unoptimized
                     className="rounded-full border border-border hover:ring-2 hover:ring-primary transition-all" />
              </a>
            ) : null
          ))}
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((m, i) => (
            <div key={i} className={cn("flex gap-3 p-3 rounded-lg bg-muted/20 border border-border/30")}>
              {m.author?.photo && (
                <Image src={m.author.photo} alt={m.author.name || ''}
                     width={32} height={32} unoptimized
                     className="rounded-full shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <a href={m.author?.url || m.url} target="_blank" rel="noopener noreferrer"
                     className="font-medium hover:text-primary">
                    {m.author?.name || 'Anonymous'}
                  </a>
                  {m.published && (
                    <span className="text-muted-foreground text-xs">
                      {new Date(m.published).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {m.content?.text && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                    {m.content.text}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
