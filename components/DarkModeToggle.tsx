// components/DarkModeToggle.tsx

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DarkModeToggle() {
  const { resolvedTheme, theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const displayTheme = resolvedTheme || 'system';

  const renderThemeIcon = () => {
    if (displayTheme === "dark") {
      return <Sun className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-transform duration-300 ease-out text-slate-100 dark:text-slate-900 group-hover:text-amber-300 dark:group-hover:text-amber-500 group-hover:rotate-45" />;
    }
    return <Moon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-transform duration-300 ease-out text-slate-100 dark:text-slate-900 group-hover:text-blue-300 dark:group-hover:text-blue-500 group-hover:-rotate-12" />;
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
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
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
						{renderThemeIcon()}
						<span className="sr-only">Toggle theme</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className={cn(
						"min-w-[120px] sm:min-w-[140px] md:min-w-[160px]",
						"p-2 sm:p-3 md:p-4",
						"rounded-xl border-2",
						"backdrop-blur-md",
						"animate-in fade-in-0 zoom-in-95",
						"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
						"bg-slate-800/95",
						"border-slate-600",
						"shadow-lg shadow-slate-900/20",
						"dark:bg-slate-100/95",
						"dark:border-slate-300",
						"dark:shadow-lg dark:shadow-slate-100/20",
						"mt-2",
						"origin-top-right"
					)}
				>
					{[
						{ icon: Sun, label: "Light", theme: "light", hoverColors: "group-hover:text-amber-300 dark:group-hover:text-amber-500" },
						{ icon: Moon, label: "Dark", theme: "dark", hoverColors: "group-hover:text-blue-300 dark:group-hover:text-blue-500" },
						{ icon: Laptop, label: "System", theme: "system", hoverColors: "group-hover:text-emerald-300 dark:group-hover:text-emerald-500" },
					].map(({ icon: Icon, label, theme, hoverColors }) => (
						<DropdownMenuItem
							key={theme}
							onClick={() => setTheme(theme)}
							className={cn(
								"group flex items-center gap-2",
								"w-full rounded-lg",
								"select-none",
								"text-xs sm:text-sm md:text-base",
								"p-2 sm:p-3",
								"transition-all duration-200 ease-in-out",
								"text-slate-100 hover:text-white",
								"hover:bg-slate-700/70 active:bg-slate-600/70",
								"dark:text-slate-900 dark:hover:text-slate-800",
								"dark:hover:bg-slate-300/70 dark:active:bg-slate-400/70"
							)}
						>
							<Icon 
								className={cn(
									"h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6",
									"transition-colors duration-200",
									"text-slate-300",
									"group-hover:text-white",
									"dark:text-slate-700",
									"dark:group-hover:text-slate-900",
									hoverColors
								)}
							/>
							<span>{label}</span>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
