import { getAllPosts, getAllTags } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import PostHeader from "@/components/PostHeader"; // Ensure this is the correct import path

interface TagPageProps {
  params: {
    tag: string;
  };
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({
    tag: tag,
  }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  return {
    title: `Posts tagged with #${tag}`,
    description: `Browse all blog posts tagged with #${tag}`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag);
  const posts = await getAllPosts();
  const tags = await getAllTags();

  if (!tags.includes(tag)) {
    notFound();
  }

  const filteredPosts = posts.filter((post) => post.tags?.includes(tag));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Posts tagged with{" "}
          <span className="text-primary">#{tag}</span>
        </h1>
        <p className="text-muted-foreground">
          Found {filteredPosts.length} post{filteredPosts.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
