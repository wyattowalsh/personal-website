import { BackendService, backend } from "@/lib/server";
import TagsGrid from '@/components/TagsGrid';
import { TagsList } from '@/components/TagsList';
import { Separator } from "@/components/ui/separator";

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
  // Single-pass tag counting to avoid O(tags * posts) nested loop
  const tagCounts = new Map<string, number>();
  validPosts.forEach(post => {
    post.tags?.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    });
  });
  const tagCountsRecord = Object.fromEntries(tagCounts);

  const sortedTags = [...tags].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <TagsList tags={sortedTags} />
        <Separator className="max-w-2xl mx-auto mb-8 bg-border/30 dark:bg-border/20" />
        <h1 className="text-4xl font-bold mb-8 text-center text-foreground">
          Browse by Tag
        </h1>
        <TagsGrid tags={sortedTags} tagCounts={tagCountsRecord} />
      </div>
    </div>
  );
}
