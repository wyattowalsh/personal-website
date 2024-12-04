import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: {
    absolute: 'Post Not Found | onelonedatum Blog'
  }
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center px-4">
      <h1 className="text-4xl font-bold">Post Not Found</h1>
      <p className="text-muted-foreground text-lg max-w-md">
        Sorry, the blog post you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Button asChild>
        <Link href="/blog">
          Return to Blog
        </Link>
      </Button>
    </div>
  );
}
