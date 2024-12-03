import { BackendService, backend } from "@/lib/server";
import TagsGrid from '@/components/TagsGrid';
import { TagsList } from '@/components/TagsList';
import { Separator } from "@/components/ui/separator"; // Add this import
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Blog Tags",
  description: "Browse blog posts by tag",
};

export default async function TagsIndexPage() {
  await BackendService.ensurePreprocessed();
  
  const [tags, posts] = await Promise.all([
    backend.getAllTags(),
    backend.getAllPosts()
  ]);

  const validPosts = posts.filter(post => post && post.tags?.length > 0);
  const tagCounts = tags.reduce((acc, tag) => {
    acc[tag] = validPosts.filter((post) => post.tags.includes(tag)).length;
    return acc;
  }, {} as Record<string, number>);

  const sortedTags = [...tags].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <TagsList tags={sortedTags} />
        <Separator className="max-w-2xl mx-auto mb-8 bg-border/30 dark:bg-border/20" />
        <h1 className="text-4xl font-bold mb-8 text-center text-foreground">
          Browse by Tag
        </h1>
        <TagsGrid tags={sortedTags} tagCounts={tagCounts} />
      </div>
    </div>
  );
}
