'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, BarChart3, FileText, PanelLeftClose, PanelLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import { useAdmin } from './AdminContext';

const NAV_ITEMS = [
  { href: '/admin', label: 'Visitors', icon: Activity },
  { href: '/admin/blog-stats', label: 'Blog Stats', icon: BarChart3 },
  { href: '/admin/content', label: 'Content', icon: FileText },
] as const;

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const inner = (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-primary/5 hover:text-primary',
        active
          ? 'border-l-2 border-primary bg-primary/5 text-primary'
          : 'text-muted-foreground border-l-2 border-transparent'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return inner;
}

export function AdminSidebar() {
  const {
    desktopSidebarOpen,
    setDesktopSidebarOpen,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useAdmin();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border bg-card/50 transition-all duration-200',
          desktopSidebarOpen ? 'w-60' : 'w-16'
        )}
      >
        <div className="flex h-14 items-center justify-between px-3">
          {desktopSidebarOpen && (
            <span className="text-sm font-semibold tracking-tight pl-1">Admin</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
          >
            {desktopSidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Separator />

        <nav className="flex-1 space-y-1 p-2">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={isActive(item.href)}
              collapsed={!desktopSidebarOpen}
            />
          ))}
        </nav>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={prefersReducedMotion ? false : { x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-border bg-card md:hidden"
            >
              <div className="flex h-14 items-center justify-between px-3">
                <span className="text-sm font-semibold tracking-tight pl-1">Admin</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              <nav className="flex-1 space-y-1 p-2">
                {NAV_ITEMS.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    active={isActive(item.href)}
                    collapsed={false}
                    onNavigate={() => setMobileSidebarOpen(false)}
                  />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
