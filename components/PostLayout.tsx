import Link from 'next/link';

const PostLayout = ({ post, children }) => (
  <article>
    <header>
      <h1>{post.title}</h1>
      <div>
        <time dateTime={post.date}>{post.date}</time>
        {/* ...existing code... */}
        {post.tags && (
          <div>
            {post.tags.map((tag) => (
              <Link key={tag} href={`/tags/${tag}`}>
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
    {children}
  </article>
);

export default PostLayout;
