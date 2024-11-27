// app/blog/page.tsx

import SearchBar from "@/components/SearchBar";
import { backend } from "@/lib/services/backend";
import ParticlesBackground from "@/components/ParticlesBackground";

export default async function BlogPostsPage() {
  // Ensure preprocessing is done before fetching data
  await backend.ensurePreprocessed();

  // Get data directly from backend
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
      </div>
    </>
  );
}
