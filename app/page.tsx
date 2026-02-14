import { BackendService } from "@/lib/server";
import HomePageClient from "@/components/HomePageClient";

export default async function HomePage() {
  // Fetch recent posts on the server
  await BackendService.ensurePreprocessed();
  const allPosts = await BackendService.getInstance().getAllPosts();

  // Get the 3 most recent posts
  const recentPosts = allPosts.slice(0, 3);

  return <HomePageClient recentPosts={recentPosts} />;
}
