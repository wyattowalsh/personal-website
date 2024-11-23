// app/blog/page.tsx

import SearchBar from "@/components/SearchBar";
import { getAllPosts, getAllTags } from "@/lib/posts";
import ParticlesBackground from "@/components/ParticlesBackground";

export default async function BlogPage() {
  const [posts, tags] = await Promise.all([
    getAllPosts(),
    getAllTags()
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      <ParticlesBackground />
      <SearchBar posts={posts} tags={tags} />
    </div>
  );
}
