"use client";

import { useState } from "react";
import { Check, Link2, Twitter, Linkedin, Facebook } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

export function ShareButtons({ url, title, description, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      track('share_click', { platform: 'clipboard' });
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  const linkClass = cn(
    "inline-flex items-center justify-center",
    "w-8 h-8 rounded-lg",
    "bg-muted hover:bg-muted/80",
    "transition-colors duration-200",
  );

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label="Share on Twitter"
        title="Share on Twitter"
        onClick={() => track('share_click', { platform: 'twitter' })}
      >
        <Twitter className="w-4 h-4 text-foreground" />
      </a>

      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
        onClick={() => track('share_click', { platform: 'linkedin' })}
      >
        <Linkedin className="w-4 h-4 text-foreground" />
      </a>

      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label="Share on Facebook"
        title="Share on Facebook"
        onClick={() => track('share_click', { platform: 'facebook' })}
      >
        <Facebook className="w-4 h-4 text-foreground" />
      </a>

      <button
        onClick={handleCopyLink}
        className={cn(
          linkClass,
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
        aria-label="Copy link"
        title="Copy link"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Link2 className="w-4 h-4 text-foreground" />
        )}
      </button>
    </div>
  );
}
