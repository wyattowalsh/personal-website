// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { PostsTable } from './PostsTable';

const posts = [
  {
    slug: 'newer-post',
    title: 'Newer Post',
    created: '2026-04-25',
    wordCount: 1200,
    readingTime: '6 min read',
    tags: ['Admin'],
  },
  {
    slug: 'older-post',
    title: 'Older Post',
    created: '2021-01-12',
    wordCount: 800,
    tags: ['Content'],
  },
];

function rowTitles() {
  return screen.getAllByRole('row').slice(1).map((row) => {
    return within(row).getByRole('link').textContent;
  });
}

describe('PostsTable', () => {
  it('describes sortable inventory data with table semantics', () => {
    render(<PostsTable posts={posts} />);

    expect(screen.getByText('Published post inventory sorted by the selected column.')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /date/i })).toHaveAttribute('aria-sort', 'descending');
    expect(screen.getByRole('button', { name: 'Sort by title' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sort by date, currently descending' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sort by words' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sort by reading time' })).toBeInTheDocument();
  });

  it('sorts from keyboard-operable header buttons', () => {
    render(<PostsTable posts={posts} />);

    expect(rowTitles()).toEqual(['Newer Post', 'Older Post']);

    fireEvent.click(screen.getByRole('button', { name: 'Sort by title' }));
    expect(screen.getByRole('columnheader', { name: /title/i })).toHaveAttribute('aria-sort', 'descending');
    expect(screen.getByRole('button', { name: 'Sort by title, currently descending' })).toBeInTheDocument();
    expect(rowTitles()).toEqual(['Older Post', 'Newer Post']);

    fireEvent.click(screen.getByRole('button', { name: 'Sort by title, currently descending' }));
    expect(screen.getByRole('columnheader', { name: /title/i })).toHaveAttribute('aria-sort', 'ascending');
    expect(screen.getByRole('button', { name: 'Sort by title, currently ascending' })).toBeInTheDocument();
    expect(rowTitles()).toEqual(['Newer Post', 'Older Post']);
  });

  it('sorts date, word count, and reading time columns by their parsed values', () => {
    render(
      <PostsTable
        posts={[
          { slug: 'two-min', title: 'Two Min', created: '2025-01-01', wordCount: 200, readingTime: '2 min read', tags: ['A'] },
          { slug: 'ten-min', title: 'Ten Min', created: '2024-01-01', wordCount: 1000, readingTime: '10 min read', tags: ['B'] },
        ]}
      />
    );

    expect(rowTitles()).toEqual(['Two Min', 'Ten Min']);

    fireEvent.click(screen.getByRole('button', { name: 'Sort by date, currently descending' }));
    expect(rowTitles()).toEqual(['Ten Min', 'Two Min']);

    fireEvent.click(screen.getByRole('button', { name: 'Sort by words' }));
    expect(rowTitles()).toEqual(['Ten Min', 'Two Min']);
    fireEvent.click(screen.getByRole('button', { name: 'Sort by words, currently descending' }));
    expect(rowTitles()).toEqual(['Two Min', 'Ten Min']);

    fireEvent.click(screen.getByRole('button', { name: 'Sort by reading time' }));
    expect(rowTitles()).toEqual(['Ten Min', 'Two Min']);
    fireEvent.click(screen.getByRole('button', { name: 'Sort by reading time, currently descending' }));
    expect(rowTitles()).toEqual(['Two Min', 'Ten Min']);
  });

  it('renders missing reading time as a neutral dash', () => {
    render(<PostsTable posts={posts} />);

    const olderPostRow = screen.getByRole('row', { name: /Older Post/ });
    expect(within(olderPostRow).getByText('-')).toBeInTheDocument();
  });

  it('renders an empty-state row when there are no posts', () => {
    render(<PostsTable posts={[]} />);

    expect(screen.getByText('No posts available.')).toBeInTheDocument();
  });
});
