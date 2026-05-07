import Link from 'next/link';
import { PostCard } from '@/components/PostCard';
import type { PostMetadata } from '@/lib/types';
import styles from '@/app/page.module.css';

interface LatestWritingProps {
  recentPosts: PostMetadata[];
}

export function LatestWriting({ recentPosts }: LatestWritingProps) {
  if (recentPosts.length === 0) return null;

  return (
    <section className={styles.latestWritingSection}>
      <h2 className={styles.latestWritingHeading}>Latest Writing</h2>
      <div className={styles.latestWritingGrid}>
        {recentPosts.map((post) => (
          <div key={post.slug}>
            <PostCard post={post} />
          </div>
        ))}
      </div>
      <Link href="/blog" className={styles.latestWritingLink}>
        View all posts →
      </Link>
    </section>
  );
}
