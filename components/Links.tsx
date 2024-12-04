"use client";

import { type LinkProps } from 'next/link';
import { type Route } from 'next';
import SocialLink from "./SocialLink";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  faCodepen,
  faGithub,
  faKaggle,
  faLinkedin,
  faReddit,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faBook, faEnvelope } from "@fortawesome/free-solid-svg-icons";

// Update Href type to handle both internal and external URLs
export type Href = Route | URL | string;

// Update Link interface
interface Link {
  name: string;
  url: string;  // Keep as string since we're handling URLs
  icon: any;
  color?: string;
}

export const links = [
  {
    name: "GitHub",
    url: "https://www.github.com/wyattowalsh",
    icon: faGithub,
    color: "#181717",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/wyattowalsh",
    icon: faLinkedin,
    color: "#0A66C2",
  },
  {
    name: "X",
    url: "https://www.x.com/wyattowalsh",
    icon: faXTwitter,
    color: "#000000",
  },
  {
    name: "Reddit",
    url: "https://www.reddit.com/user/onelonedatum",
    icon: faReddit,
    color: "#FF4500",
  },
  {
    name: "Blog",
    url: "/blog",
    icon: faBook,
  },
  {
    name: "Kaggle",
    url: "https://www.kaggle.com/wyattowalsh",
    icon: faKaggle,
    color: "#20BEFF",
  },
  {
    name: "CodePen",
    url: "https://codepen.io/wyattowalsh",
    icon: faCodepen,
    color: "#000000",
  },
  {
    name: "Email",
    url: "mailto:mail@w4wdev.com",
    icon: faEnvelope,
  },
].map((link) => ({
  ...link,
  color: link.color || "#6a9fb5",
}));

// Explicitly type the component as React.FC
const Links: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        // Grid layout
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        "gap-4 sm:gap-6 md:gap-8 lg:gap-10",
        "p-4 sm:p-6 md:p-8 lg:p-10",
        // Container dimensions
        "w-full max-w-[95vw] md:max-w-6xl mx-auto",
        "rounded-2xl",
        // Enhanced glass effect with proper contrast
        "bg-white/5 dark:bg-slate-900/10",
        "backdrop-blur-xl",
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
        "transition-all duration-500 ease-in-out",
        // Enhanced background effects
        "after:absolute after:inset-0 after:-z-10",
        "after:bg-gradient-to-br after:from-white/10 after:to-primary/5",
        "after:dark:from-primary-light/5 after:dark:to-transparent",
        "after:rounded-2xl after:blur-3xl after:transition-opacity",
        "hover:after:opacity-100"
      )}
    >
      {links.map((link, index) => (
        <motion.div
          key={link.name}
          variants={itemVariants}
          custom={index}
          className={cn(
            "w-full",
            "min-h-[100px] sm:min-h-[120px]",
            // Add hover state feedback
            "group",
            "transition-transform duration-500",
            "hover:z-10",
            // Ensure proper stacking
            "relative isolate",
          )}
        >
          <SocialLink link={link} />
        </motion.div>
      ))}
    </motion.div>
  );
};

// Keep default export
export default Links;
