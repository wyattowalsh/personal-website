import { SocialLink } from "./SocialLink";
import { cn } from "@/lib/utils";
import { Github, Linkedin, Twitter, Codepen, BookOpen, Mail } from 'lucide-react';
import { Reddit } from './icons/Reddit';
import { Kaggle } from './icons/Kaggle';

export const links = [
  {
    name: "GitHub",
    url: "https://www.github.com/wyattowalsh",
    icon: Github,
    color: "#181717",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/wyattowalsh",
    icon: Linkedin,
    color: "#0A66C2",
  },
  {
    name: "X",
    url: "https://www.x.com/wyattowalsh",
    icon: Twitter,
    color: "#000000",
  },
  {
    name: "Reddit",
    url: "https://www.reddit.com/user/onelonedatum",
    icon: Reddit,
    color: "#FF4500",
  },
  {
    name: "Blog",
    url: "/blog",
    icon: BookOpen,
  },
  {
    name: "Kaggle",
    url: "https://www.kaggle.com/wyattowalsh",
    icon: Kaggle,
    color: "#20BEFF",
  },
  {
    name: "CodePen",
    url: "https://codepen.io/wyattowalsh",
    icon: Codepen,
    color: "#000000",
  },
  {
    name: "Email",
    url: "mailto:mail@w4wdev.com",
    icon: Mail,
  },
].map((link) => ({
  ...link,
  color: link.color || "#6a9fb5",
}));

export function Links() {
  return (
    <div
      className={cn(
        "relative isolate",
        // Grid layout - tighter, more editorial
        "grid grid-cols-2 sm:grid-cols-4",
        "gap-3 sm:gap-4 md:gap-5 lg:gap-6",
        "p-4 sm:p-5 md:p-6 lg:p-8",
        // Container dimensions
        "w-full max-w-[95vw] md:max-w-4xl mx-auto",
        "rounded-2xl",
        // Refined glass effect - lighter, more premium
        "bg-white/40 dark:bg-slate-900/30",
        "backdrop-blur-sm",
        // Subtle border with gradient
        "border border-black/[0.04] dark:border-white/[0.06]",
        // Refined shadows - less heavy, more refined
        "shadow-lg shadow-black/[0.03] dark:shadow-black/30",
        // Smooth transitions
        "motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
        "motion-reduce:transition-none",
        // Inner highlight for depth
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-2xl",
        "before:bg-gradient-to-b before:from-white/60 before:to-transparent",
        "dark:before:from-white/[0.02] dark:before:to-transparent",
      )}
    >
      {links.map((link) => (
        <div
          key={link.name}
          className={cn(
            "w-full",
            "min-h-[90px] sm:min-h-[100px]",
            "hover:z-10",
            "relative isolate",
          )}
        >
          <SocialLink link={link} />
        </div>
      ))}
    </div>
  );
}
