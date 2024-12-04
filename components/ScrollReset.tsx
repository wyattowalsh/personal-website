"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    // Reset scroll position when the pathname changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
} 