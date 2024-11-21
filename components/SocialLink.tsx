"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";
import { motion } from "framer-motion";

interface SocialLinkProps {
  link: {
    name: string;
    url: string;
    icon: IconProp;
    color: string;
  };
}

export default function SocialLink({ link }: SocialLinkProps) {
  const isInternalLink = link.url.startsWith("/");

  const content = (
    <motion.div
      className="flex flex-col items-center justify-center space-y-2"
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
    >
      <FontAwesomeIcon icon={link.icon} style={{ color: link.color, fontSize: "2rem" }} />
      <span className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
        {link.name}
      </span>
    </motion.div>
  );

  return isInternalLink ? (
    <Link
      href={link.url}
      className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg transform transition-transform hover:rotate-1 hover:scale-110 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white"
    >
      {content}
    </Link>
  ) : (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg transform transition-transform hover:rotate-1 hover:scale-110 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white"
    >
      {content}
    </a>
  );
}
