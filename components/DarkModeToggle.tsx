// components/DarkModeToggle.tsx

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DarkModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className={cn(
      "fixed z-50",
      "top-2 right-2",
      "sm:top-3 sm:right-3",
      "md:top-4 md:right-4",
      "lg:top-6 lg:right-6",
      "p-1 sm:p-1.5 md:p-2",
      "sm:bg-transparent",
      "rounded-full"
    )}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn(
          "h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14",
          "group relative",
          "rounded-full",
          "border-2",
          "transition-all duration-300 ease-in-out",
          "hover:scale-110 active:scale-95",
          "bg-slate-800/95 hover:bg-slate-700/95",
          "border-slate-600 hover:border-slate-500",
          "shadow-lg shadow-slate-900/20",
          "dark:bg-slate-100/95 dark:hover:bg-slate-200/95",
          "dark:border-slate-300 dark:hover:border-slate-400",
          "dark:shadow-lg dark:shadow-slate-100/20",
          "after:absolute after:inset-0 after:rounded-full",
          "after:transition-opacity after:duration-300",
          "after:opacity-0 hover:after:opacity-100",
          "after:bg-slate-400/20 dark:after:bg-slate-600/20"
        )}
      >
        {resolvedTheme === "dark" ? (
          <Sun className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-transform duration-300 ease-out text-slate-100 dark:text-slate-900 group-hover:text-amber-300 dark:group-hover:text-amber-500 group-hover:rotate-45" />
        ) : (
          <Moon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-transform duration-300 ease-out text-slate-100 dark:text-slate-900 group-hover:text-blue-300 dark:group-hover:text-blue-500 group-hover:-rotate-12" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}
