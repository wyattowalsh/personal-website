import Link from 'next/link';

const ListLayout = ({ posts }) => (
  <div>
    {posts.map((post) => (
      <article key={post.slug}>
        <h2>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p>{post.summary}</p>
      </article>
    ))}
  </div>
);

export default ListLayout;
