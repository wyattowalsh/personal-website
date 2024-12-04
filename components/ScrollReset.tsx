"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    // Reset scroll position when the pathname changes
    const resetScroll = () => {
      // Force scroll to absolute top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant" // Use instant instead of smooth to ensure immediate reset
      });
      
      // Double-check the scroll position after a small delay
      // This ensures the scroll reset happens after any dynamic content loads
      setTimeout(() => {
        if (window.scrollY !== 0) {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
          });
        }
      }, 100);
    };

    resetScroll();
  }, [pathname]);

  return null;
} 