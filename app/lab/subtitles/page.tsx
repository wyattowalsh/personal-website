import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SubtitleAuditLab } from '@/components/landing-title/SubtitleAuditLab';

export const metadata: Metadata = {
  title: 'Subtitle Audit Lab',
  robots: { index: false, follow: false },
};

function SubtitleAuditFallback() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
        Subtitle Audit Lab
      </p>
      <div className="rounded-[1.75rem] border border-border/60 bg-background/80 p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Loading subtitle inspection controls…</p>
      </div>
    </div>
  );
}

export default function SubtitleAuditPage() {
  return (
    <Suspense fallback={<SubtitleAuditFallback />}>
      <SubtitleAuditLab />
    </Suspense>
  );
}
