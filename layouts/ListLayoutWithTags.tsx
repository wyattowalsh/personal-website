'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { CoreContent } from '@/lib/utils';
import type { Blog } from 'contentlayer/generated';
import Link from 'next/link';
import Tag from '@/components/Tag';
import siteMetadata from '@/data/siteMetadata';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

interface ListLayoutProps {
  posts: CoreContent<Blog>[];
  initialDisplayPosts: CoreContent<Blog>[];
  pagination: PaginationProps;
  title?: string;
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname();
  const basePath = pathname.split('/')[1];

  return (
    <div className="flex justify-between">
      {currentPage > 1 && (
        <Link href={`/${basePath}/page/${currentPage - 1}`} className="text-primary font-display">
          Previous
        </Link>
      )}
      {currentPage < totalPages && (
        <Link href={`/${basePath}/page/${currentPage + 1}`} className="text-primary font-display">
          Next
        </Link>
      )}
    </div>
  );
}

export default function ListLayoutWithTags({
  posts,
  initialDisplayPosts,
  pagination,
  title = 'All Posts',
}: ListLayoutProps) {
  const [searchValue, setSearchValue] = useState('');

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-12">
        <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 font-display">
          {title}
        </h1>
        <div className="relative max-w-lg">
          <input
            aria-label="Search articles"
            type="text"
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search articles"
            className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <svg
            className="absolute w-5 h-5 text-gray-400 right-3 top-3 dark:text-gray-300"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!filteredPosts.length && 'No posts found.'}
          {filteredPosts.map((post) => {
            const { slug, date, title, summary, tags } = post;
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:space-y-0 xl:items-baseline">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold leading-8 tracking-tight">
                            <Link href={`/blog/${slug}`} className="text-gray-900 dark:text-gray-100">
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose text-gray-500 max-w-none dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                      <div className="text-base font-medium leading-6">
                        <Link
                          href={`/blog/${slug}`}
                          className="text-primary hover:text-primary-dark dark:hover:text-primary-light font-display"
                          aria-label={`Read "${title}"`}
                        >
                          Read more &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
        {pagination && pagination.totalPages > 1 && (
          <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
        )}
      </div>
    </div>
  );
}
