// app/blog/page.tsx

import SearchBar from "@/components/SearchBar";
import { BackendService, backend } from "@/lib/server";
import ParticlesBackground from "@/components/ParticlesBackground";
import { RssIcon, FileJson, AtomIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "next/link"; 


const FeedFormatButton = ({ href, icon: Icon, format, description }: { 
  href: string;
  icon: React.ElementType;
  format: string;
  description: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2",
          "rounded-lg border border-border/50",
          "bg-card/80 backdrop-blur-sm",
          "hover:bg-accent/10 hover:border-accent/50",
          "transition-all duration-200"
        )}
      >
        <Icon className="w-4 h-4" />
        <span>{format}</span>
      </Link>
    </TooltipTrigger>
    <TooltipContent>{description}</TooltipContent>
  </Tooltip>
);

export default async function BlogPostsPage() {
  // Ensure preprocessing is done before fetching data
  await BackendService.ensurePreprocessed();

  // Get data using the backend instance
  const posts = await backend.getAllPosts();
  const tags = await backend.getAllTags();

  // Filter any null/undefined posts and ensure all required fields
  const validPosts = posts.filter(post => 
    post && post.title && post.slug && post.created && post.tags
  );

  return (
    <>
      <ParticlesBackground />
      <div className="py-8">
        <SearchBar posts={validPosts} tags={tags} />
        
        {/* Feed Formats Section */}
        <div className={cn(
          "mt-8 px-4",
          "flex flex-col items-center gap-4"
        )}>
          <h2 className="text-lg font-semibold text-foreground/80">
            Subscribe to Updates
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <FeedFormatButton
              href="/feed.xml"
              icon={RssIcon}
              format="RSS"
              description="Traditional RSS feed format"
            />
            <FeedFormatButton
              href="/feed.atom"
              icon={AtomIcon}
              format="Atom"
              description="Modern Atom feed format"
            />
            <FeedFormatButton
              href="/feed.json"
              icon={FileJson}
              format="JSON"
              description="JSON Feed for programmatic access"
            />
          </div>
        </div>
      </div>
    </>
  );
}
