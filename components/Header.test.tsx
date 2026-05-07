// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Header } from '@/components/Header';

const pathnameMock = vi.hoisted(() => ({ value: '/' }));

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock.value,
}));

vi.mock('@/components/BlogBackLink', () => ({
  BlogBackLink: () => <a href="/blog">Blog</a>,
}));

vi.mock('@/components/DarkModeToggle', () => ({
  DarkModeToggle: () => <button type="button">Toggle theme</button>,
}));

describe('Header', () => {
  it('does not render public header controls on admin routes', () => {
    pathnameMock.value = '/admin';

    render(<Header />);

    expect(screen.queryByRole('banner')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Toggle theme' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Blog' })).toBeNull();
  });

  it('renders public header controls outside admin routes', () => {
    pathnameMock.value = '/blog';

    render(<Header />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument();
  });
});
