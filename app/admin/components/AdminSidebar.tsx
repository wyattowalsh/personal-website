'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, BarChart3, FileText, PanelLeftClose, PanelLeft, Radar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import { useAdmin } from './AdminContext';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: Activity },
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
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'group/nav relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300',
        'hover:bg-primary/[0.06] hover:text-primary',
        active
          ? 'text-primary'
          : 'text-muted-foreground'
      )}
    >
      {/* active indicator bar */}
      <span
        className={cn(
          'absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-all duration-300',
          active ? 'opacity-100' : 'opacity-0 group-hover/nav:opacity-40'
        )}
      />

      {/* active background glow */}
      {active && (
        <span className="absolute inset-0 rounded-lg bg-primary/[0.06] transition-opacity duration-300" />
      )}

      <span className="relative z-10 flex items-center gap-3">
        <Icon className={cn(
          'h-4 w-4 shrink-0 transition-all duration-300',
          active ? 'text-primary' : 'text-muted-foreground/70 group-hover/nav:text-primary'
        )} />
        {!collapsed && <span className="transition-colors duration-300">{label}</span>}
      </span>
    </Link>
  );
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
          'hidden md:flex flex-col border-r border-border/60 bg-card/60 backdrop-blur-xl transition-all duration-300',
          desktopSidebarOpen ? 'w-60' : 'w-16'
        )}
      >
        <div className="flex h-14 items-center justify-between px-3">
          <AnimatePresence mode="wait">
            {desktopSidebarOpen && (
              <motion.span
                key="sidebar-label"
                initial={prefersReducedMotion ? undefined : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center gap-2 pl-1 text-sm font-semibold tracking-tight"
              >
                <Radar className="size-4 text-[hsl(var(--chart-1))]" />
                Admin
              </motion.span>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 transition-all duration-200 hover:bg-primary/[0.08]"
            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
          >
            {desktopSidebarOpen ? (
              <PanelLeftClose className="h-4 w-4 transition-transform duration-200" />
            ) : (
              <PanelLeft className="h-4 w-4 transition-transform duration-200" />
            )}
          </Button>
        </div>

        <Separator className="opacity-40" />

        <nav className="flex-1 space-y-0.5 p-2">
          {NAV_ITEMS.map((item) => (
            <Tooltip key={item.href} delayDuration={!desktopSidebarOpen ? 0 : 1000}>
              <TooltipTrigger asChild>
                <div>
                  <NavItem
                    {...item}
                    active={isActive(item.href)}
                    collapsed={!desktopSidebarOpen}
                  />
                </div>
              </TooltipTrigger>
              {!desktopSidebarOpen && (
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={prefersReducedMotion ? undefined : { x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-border/60 bg-card/80 backdrop-blur-xl md:hidden"
            >
              <div className="flex h-14 items-center justify-between px-3">
                <span className="inline-flex items-center gap-2 pl-1 text-sm font-semibold tracking-tight">
                  <Radar className="size-4 text-[hsl(var(--chart-1))]" />
                  Admin
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Separator className="opacity-40" />

              <nav className="flex-1 space-y-0.5 p-2">
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
