
import Link from "next/link";
import { Post } from "@/lib/posts";

interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li key={post.slug} className="border-b pb-4">
          <Link href={`/blog/${post.slug}`}>
            <h2 className="text-xl font-semibold">{post.title}</h2>
          </Link>
          <p className="text-gray-600">{post.summary}</p>
          <div className="text-sm">
            {post.tags.map((tag) => (
              <span key={tag} className="mr-2 text-blue-600">
                #{tag}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
