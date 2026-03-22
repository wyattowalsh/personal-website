import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BookOpen, ChevronRight } from 'lucide-react';

interface SeriesNavProps {
  seriesName: string;
  currentSlug: string;
  posts: Array<{ slug: string; title: string; order: number }>;
}

export function SeriesNav({ seriesName, currentSlug, posts }: SeriesNavProps) {
  const currentIndex = posts.findIndex(p => p.slug === currentSlug);
  const total = posts.length;

  return (
    <div className={cn(
      "my-6 p-4 rounded-xl",
      "border border-border/50",
      "bg-gradient-to-br from-primary/5 via-transparent to-transparent"
    )}>
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-primary">{seriesName}</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          Part {currentIndex + 1} of {total}
        </span>
      </div>
      <ol className="space-y-1.5">
        {posts.map((post, i) => {
          const isCurrent = post.slug === currentSlug;
          return (
            <li key={post.slug}>
              {isCurrent ? (
                <span aria-current="page" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                  <ChevronRight className="h-3.5 w-3.5" />
                  {post.title}
                </span>
              ) : (
                <Link href={`/blog/posts/${post.slug}`}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                  <span className="w-5 text-center text-xs">{i + 1}</span>
                  {post.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
