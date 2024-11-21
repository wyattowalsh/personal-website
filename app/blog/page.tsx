// app/blog/page.tsx

import SearchBar from "@/components/SearchBar";
import { getAllPosts, getAllTags } from "@/lib/posts";

export default async function BlogPage() {
  const posts = await getAllPosts();
  const tags = await getAllTags();

  return (
    <div className="container mx-auto py-8 px-4">
      <SearchBar posts={posts} tags={tags} />
    </div>
  );
}
