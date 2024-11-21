import { getAllPosts, getAllTags } from "@/lib/posts";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Blog Tags",
  description: "Browse blog posts by tag",
};

export default async function TagsIndexPage() {
  const tags = await getAllTags();
  const posts = await getAllPosts();

  // Create a map of tags to post counts
  const tagCounts = tags.reduce((acc, tag) => {
    acc[tag] = posts.filter((post) => post.tags?.includes(tag)).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Browse by Tag</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tags.map((tag) => (
          <Link key={tag} href={`/blog/tags/${tag}`}>
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="text-lg">
                  #{tag}
                </Badge>
                <span className="text-muted-foreground">
                  {tagCounts[tag]} post{tagCounts[tag] === 1 ? "" : "s"}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
