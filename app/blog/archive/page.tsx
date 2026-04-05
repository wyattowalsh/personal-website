import { BackendService } from '@/lib/server';
import { getConfig } from '@/lib/config';
import { generateCollectionPageSchema, generateBreadcrumbSchema } from '@/lib/schema';
import { JsonLd } from '@/components/PostSchema';
import { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Tag } from 'lucide-react';

const siteUrl = getConfig().site.url;

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Browse all blog posts by date',
  alternates: { canonical: `${siteUrl}/blog/archive` },
  openGraph: {
    type: 'website',
    title: 'Archive - Wyatt Walsh',
    description: 'Browse all blog posts by date',
    url: `${siteUrl}/blog/archive`,
    siteName: 'Wyatt Walsh',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Archive - Wyatt Walsh',
    description: 'Browse all blog posts by date',
  },
};

export const dynamic = 'force-static';

export default async function ArchivePage() {
  await BackendService.ensurePreprocessed();
  const posts = await BackendService.getInstance().getAllPosts();

  // Group posts by year
  const postsByYear = new Map<number, typeof posts>();
  for (const post of posts) {
    const year = new Date(post.created).getFullYear();
    if (!postsByYear.has(year)) postsByYear.set(year, []);
    postsByYear.get(year)!.push(post);
  }

  // Sort years descending
  const years = [...postsByYear.keys()].sort((a, b) => b - a);

  // Generate schemas
  const collectionSchema = generateCollectionPageSchema({
    name: 'Blog Archive',
    description: 'All blog posts by date',
    url: `${siteUrl}/blog/archive`,
    items: posts.map(post => ({
      name: post.title,
      url: `${siteUrl}/blog/posts/${post.slug}`,
      ...(post.created ? { datePublished: post.created } : {}),
    })),
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Blog', item: '/blog' },
    { name: 'Archive', item: '/blog/archive' },
  ], siteUrl);

  return (
    <>
      <JsonLd data={[collectionSchema, breadcrumbSchema]} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Archive</h1>
        <p className="text-muted-foreground mb-8">
          {posts.length} posts across {years.length} year{years.length !== 1 ? 's' : ''}
        </p>

        <div className="space-y-12">
          {years.map(year => (
            <section key={year}>
              <h2 className="text-2xl font-bold text-primary mb-4 sticky top-20 bg-background/80 backdrop-blur-sm py-2 z-10">
                {year}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({postsByYear.get(year)!.length} posts)
                </span>
              </h2>

              <div className="relative pl-8 border-l-2 border-border space-y-6">
                {postsByYear.get(year)!.map(post => (
                  <article key={post.slug} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[calc(2rem+5px)] w-3 h-3 rounded-full bg-primary/60 border-2 border-background" />

                    <Link href={`/blog/posts/${post.slug}`} className="group block">
                      <div className={cn(
                        "p-4 rounded-lg",
                        "bg-card/30 hover:bg-card/60",
                        "border border-border/30 hover:border-border/60",
                        "transition-all duration-200"
                      )}>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        {post.summary && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {post.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.created).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric'
                            })}
                          </span>
                          {post.readingTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readingTime}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {post.tags.slice(0, 3).join(', ')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
