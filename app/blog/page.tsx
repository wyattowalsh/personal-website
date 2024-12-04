import { BackendService, backend } from "@/lib/server";
import BlogPageContent from "@/components/BlogPageContent";

export default async function BlogPostsPage() {
  await BackendService.ensurePreprocessed();
  const posts = await backend.getAllPosts();
  const tags = await backend.getAllTags();
  
  const validPosts = posts.filter(post => 
    post && post.title && post.slug && post.created && post.tags
  );

  return <BlogPageContent posts={validPosts} tags={tags} />;
}
