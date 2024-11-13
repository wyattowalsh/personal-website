import { useState } from 'react';
import { allBlogs } from 'contentlayer/generated';
import Link from 'next/link';

const Search = () => {
  const [query, setQuery] = useState('');
  const filteredPosts = allBlogs.filter(
    (post) =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.summary.toLowerCase().includes(query.toLowerCase()) ||
      (post.tags && post.tags.join(' ').toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul>
        {filteredPosts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
