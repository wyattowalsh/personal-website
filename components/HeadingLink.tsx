"use client";

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HeadingLink({ id }: { id?: string }) {
  const [copied, setCopied] = useState(false);

  if (!id) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => { /* clipboard denied — no feedback */ });
  };

  return (
    <a
      href={`#${id}`}
      onClick={handleCopy}
      className={cn(
        "opacity-0 group-hover:opacity-100",
        "ml-2 inline-flex items-center",
        "text-muted-foreground hover:text-primary",
        "transition-all duration-200",
        "flex-shrink-0"
      )}
      aria-label="Copy link to section"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Link2 className="h-4 w-4" />
      )}
    </a>
  );
}
