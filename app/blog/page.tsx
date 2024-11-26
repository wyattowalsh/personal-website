// app/blog/page.tsx

import SearchBar from "@/components/SearchBar";
import { getAllTags, getAllPosts } from "@/lib/services";
import ParticlesBackground from "@/components/ParticlesBackground";

export default async function BlogPostsPage() { // Renamed from BlogPage
  const [posts, tags] = await Promise.all([
    getAllPosts(),
    getAllTags()
  ]);

  return (
    <>
      <ParticlesBackground />
      <div className="py-8">
        <SearchBar posts={posts} tags={tags} />
        <div className="grid gap-4 mt-8">
          {posts.map((post) => (
            <article key={post.slug}>
              {/* Post content */}
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
