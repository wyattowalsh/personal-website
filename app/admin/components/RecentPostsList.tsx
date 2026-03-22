import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TagPill } from '@/components/ui/tag-pill';
import { formatDate } from '@/lib/utils';

interface RecentPostsListProps {
  posts: Array<{
    slug: string;
    title: string;
    created: string;
    wordCount: number;
    tags: string[];
  }>;
}

export function RecentPostsList({ posts }: RecentPostsListProps) {
  const recentPosts = posts.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Posts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {recentPosts.map((post, index) => (
          <div
            key={post.slug}
            className={index < recentPosts.length - 1 ? 'border-b border-border/50 pb-4 mb-4' : ''}
          >
            <Link
              href={`/blog/posts/${post.slug}`}
              className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
            >
              {post.title}
            </Link>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span>{formatDate(post.created)}</span>
              <span>{post.wordCount.toLocaleString()} words</span>
            </div>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {post.tags.map((tag) => (
                  <TagPill key={tag} tag={tag} variant="default" />
                ))}
              </div>
            )}
          </div>
        ))}
        {recentPosts.length === 0 && (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
