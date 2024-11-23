"use client";

import React, { useEffect, useState } from "react";
import { animateScroll } from "react-scroll";
import { cn } from "@/lib/utils";

const CustomScrollbars = ({ children }: { children: React.ReactNode }) => {
  const [showButton, setShowButton] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const contentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      setHasOverflow(contentHeight > viewportHeight);
    };

    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };

    // Check overflow on mount and window resize
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", checkOverflow);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    animateScroll.scrollToTop({
      duration: 500,
      smooth: "easeInOutQuint",
    });
  };

  return (
    <div className={`relative min-h-full ${hasOverflow ? 'overflow-y-auto' : 'overflow-y-hidden'}`}>
      {children}
      {hasOverflow && showButton && (
        <button
          onClick={scrollToTop}
          className="fixed z-50 p-3 rounded-full shadow-lg backdrop-blur-sm bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/90 dark:hover:bg-gray-700/90 text-gray-700 dark:text-gray-300 transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:focus-visible:ring-primary/50 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
          aria-label="Scroll to top"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default CustomScrollbars;
