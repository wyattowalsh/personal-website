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
        "rounded-2xl",
        // Enhanced glass effect with proper contrast
        "bg-white/5 dark:bg-slate-900/10",
        // Themed borders
        "border border-primary/10 dark:border-primary-light/10",
        // Dynamic shadows
        "shadow-xl shadow-black/5 dark:shadow-black/20",
        "hover:shadow-2xl hover:shadow-primary/10 dark:hover:shadow-primary-light/20",
        // Enhanced gradients using theme colors
        "bg-gradient-to-br",
        "from-primary/5 via-transparent to-accent/5",
        "dark:from-primary-light/5 dark:via-transparent dark:to-accent/5",
        // Smooth transitions
        "motion-safe:transition-shadow motion-safe:duration-300 motion-safe:ease-out",
        "motion-reduce:transition-none",
        // Lightweight background effects
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-2xl",
        "before:bg-gradient-to-br before:from-white/10 before:to-primary/5",
        "before:opacity-70 dark:before:from-primary-light/5 dark:before:to-transparent",
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
