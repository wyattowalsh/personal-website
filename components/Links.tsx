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
        // Grid layout
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        "gap-4 sm:gap-6 md:gap-8 lg:gap-10",
        "p-4 sm:p-6 md:p-8 lg:p-10",
        // Container dimensions
        "w-full max-w-[95vw] md:max-w-6xl mx-auto",
        "rounded-[1.75rem]",
        // Enhanced glass effect with proper contrast
        "bg-white/6 dark:bg-slate-950/16 backdrop-blur-xl",
        // Themed borders
        "border border-primary/12 dark:border-primary-light/12",
        // Dynamic shadows
        "shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:shadow-[0_32px_90px_rgba(2,6,23,0.36)]",
        "hover:shadow-[0_36px_96px_rgba(59,130,246,0.12)] dark:hover:shadow-[0_36px_110px_rgba(125,211,252,0.18)]",
        // Enhanced gradients using theme colors
        "bg-gradient-to-br",
        "from-white/45 via-white/20 to-primary/6",
        "dark:from-slate-900/45 dark:via-slate-950/16 dark:to-primary-light/8",
        // Smooth transitions
        "motion-safe:transition-[box-shadow,border-color,background-color] motion-safe:duration-300 motion-safe:ease-out",
        "motion-reduce:transition-none",
        // Lightweight background effects
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-2xl",
        "before:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_58%)]",
        "before:opacity-80 dark:before:bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.12),transparent_62%)]",
        "after:pointer-events-none after:absolute after:inset-px after:-z-10 after:rounded-[1.6rem]",
        "after:border after:border-white/35 dark:after:border-white/6",
      )}
    >
      {links.map((link) => (
        <div
          key={link.name}
          className={cn(
            "w-full",
            "min-h-[100px] sm:min-h-[120px]",
            "hover:z-10",
            // Ensure proper stacking
            "relative isolate",
          )}
        >
          <SocialLink link={link} />
        </div>
      ))}
    </div>
  );
}
