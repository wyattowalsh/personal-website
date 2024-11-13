// app/blog/page.tsx

import BlogList from "@/components/BlogList";
import ListLayout from '@/layouts/ListLayoutWithTags';

export default function BlogPage() {
  // Fetch posts data from your own data source
  const posts = []; // Replace with actual posts fetching logic
  const initialDisplayPosts = []; // Replace with actual initial display posts logic
  const pagination = {}; // Replace with actual pagination logic

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      className="text-primary font-display" // new styles
    />
  );
}
