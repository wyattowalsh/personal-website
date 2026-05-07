// @vitest-environment jsdom
import type { ComponentProps, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AdminProvider } from './AdminContext';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function installMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function AdminShell({ value }: { value: ComponentProps<typeof AdminProvider>['value'] }) {
  return (
    <main id="main-content">
      <AdminProvider value={value}>
        <TooltipProvider>
          <AdminSidebar />
          <div
            data-testid="admin-shell-content"
            aria-hidden={value.mobileSidebarOpen ? 'true' : undefined}
            inert={value.mobileSidebarOpen ? true : undefined}
          >
            <a href="#admin-main">Skip admin navigation</a>
            <AdminHeader />
            <div id="admin-main" role="region" aria-label="Admin content" tabIndex={-1} data-testid="admin-content">
              <button type="button">Background action</button>
            </div>
          </div>
        </TooltipProvider>
      </AdminProvider>
    </main>
  );
}

function renderAdminShell(valueOverrides: Partial<ComponentProps<typeof AdminProvider>['value']> = {}) {
  const value = {
    logout: vi.fn(async () => undefined),
    desktopSidebarOpen: true,
    setDesktopSidebarOpen: vi.fn(),
    mobileSidebarOpen: false,
    setMobileSidebarOpen: vi.fn(),
    ...valueOverrides,
  };

  render(<AdminShell value={value} />);

  return value;
}

describe('admin shell accessibility', () => {
  it('names compact navigation controls and breadcrumbs', () => {
    installMatchMedia();
    renderAdminShell();

    expect(screen.getByRole('button', { name: 'Open admin navigation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse admin sidebar' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Admin breadcrumbs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
  });

  it('keeps admin content as a region instead of adding a nested main landmark', () => {
    installMatchMedia();
    renderAdminShell();

    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('region', { name: 'Admin content' })).toHaveAttribute('id', 'admin-main');
    expect(screen.getByRole('region', { name: 'Admin content' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('link', { name: 'Skip admin navigation' })).toHaveAttribute('href', '#admin-main');
  });

  it('hides and inerts admin content while the mobile drawer is open', () => {
    installMatchMedia();
    renderAdminShell({ mobileSidebarOpen: true });

    const shellContent = screen.getByTestId('admin-shell-content');
    expect(shellContent).toHaveAttribute('aria-hidden', 'true');
    expect(shellContent).toHaveAttribute('inert');
    expect(shellContent).toContainElement(screen.getByRole('link', { name: 'Skip admin navigation', hidden: true }));
  });

  it('keeps collapsed desktop navigation links named', () => {
    installMatchMedia();
    renderAdminShell({ desktopSidebarOpen: false });

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Blog Stats' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Content' })).toBeInTheDocument();
  });

  it('names the mobile drawer and closes it with Escape', () => {
    installMatchMedia();
    const setMobileSidebarOpen = vi.fn();
    renderAdminShell({ mobileSidebarOpen: true, setMobileSidebarOpen });

    expect(screen.getByRole('dialog', { name: 'Admin navigation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close admin navigation' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(setMobileSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('keeps Tab focus inside the mobile drawer', () => {
    installMatchMedia();
    renderAdminShell({ mobileSidebarOpen: true });

    const dialog = screen.getByRole('dialog', { name: 'Admin navigation' });
    const drawer = within(dialog);
    const closeButton = drawer.getByRole('button', { name: 'Close admin navigation' });
    const contentLink = drawer.getByRole('link', { name: 'Content' });

    closeButton.focus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(contentLink).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(closeButton).toHaveFocus();
  });

  it('restores focus to the opener when the mobile drawer closes', () => {
    installMatchMedia();
    const baseValue = {
      logout: vi.fn(async () => undefined),
      desktopSidebarOpen: true,
      setDesktopSidebarOpen: vi.fn(),
      mobileSidebarOpen: false,
      setMobileSidebarOpen: vi.fn(),
    };

    const { rerender } = render(<AdminShell value={baseValue} />);
    const openButton = screen.getByRole('button', { name: 'Open admin navigation' });
    openButton.focus();

    rerender(<AdminShell value={{ ...baseValue, mobileSidebarOpen: true }} />);
    expect(screen.getByRole('button', { name: 'Close admin navigation' })).toHaveFocus();

    rerender(<AdminShell value={baseValue} />);
    expect(openButton).toHaveFocus();
  });
});
