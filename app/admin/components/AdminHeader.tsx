'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, LogOut, Shield, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAdmin } from './AdminContext';

const ROUTE_LABELS: Record<string, string> = {
  admin: 'Visitor Analytics',
  'blog-stats': 'Blog Stats',
  content: 'Content',
};

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((seg, i) => ({
    label: ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav className="flex items-center gap-1 text-sm">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/40" />}
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export function AdminHeader() {
  const { logout, setMobileSidebarOpen } = useAdmin();

  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between px-4 md:px-6',
        'border-b border-border/60 bg-card/60 backdrop-blur-xl'
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:hidden transition-colors duration-200 hover:bg-primary/[0.08]"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground mr-2">
          <Shield className="h-3.5 w-3.5" />
          <span>Admin</span>
        </div>
        <Separator orientation="vertical" className="hidden sm:block h-5 opacity-40" />
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-destructive transition-colors duration-200"
          onClick={logout}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
