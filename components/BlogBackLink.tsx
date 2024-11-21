"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function BlogBackLink() {
  const pathname = usePathname();
  const isBlogHome = pathname === "/blog";
  const showBackLink = pathname !== "/";

  if (!showBackLink) {
    return <div />;
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} className="mb-4 text-center">
      <Link href={isBlogHome ? "/" : "/blog"}>
        <Button variant="ghost" className="text-primary">
          ← Back to {isBlogHome ? "Home" : "Blog"}
        </Button>
      </Link>
    </motion.div>
  );
}
