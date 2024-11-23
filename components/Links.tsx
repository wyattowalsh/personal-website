"use client";

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
  color: link.color || "var(--primary-color)",
}));

export default function Links() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
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
        // Responsive grid
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        "gap-3 sm:gap-4 md:gap-6 lg:gap-8",
        // Responsive padding
        "p-3 sm:p-4 md:p-6 lg:p-8",
        // Container styling
        "w-full max-w-[95vw] md:max-w-5xl mx-auto",
        "rounded-xl",
        // Theme-aware background
        "bg-gradient-to-br",
        "from-background/30 to-background/10",
        "dark:from-background/20 dark:to-background/5",
        // Enhanced blur and border
        "backdrop-blur-sm",
        "border border-primary/5",
        "dark:border-primary/10",
        // Improved shadows
        "shadow-xl shadow-primary/5",
        "dark:shadow-primary/10",
        // Smooth transitions
        "transition-colors duration-300"
      )}
    >
      {links.map((link, index) => (
        <motion.div
          key={link.name}
          variants={itemVariants}
          custom={index}
          className={cn(
            "w-full",
            // Ensure minimum touch target size
            "min-h-[100px] sm:min-h-[120px]"
          )}
        >
          <SocialLink link={link} />
        </motion.div>
      ))}
    </motion.div>
  );
}
