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
	const { theme, setTheme, systemTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const currentTheme = theme === "system" ? systemTheme : theme;

	const renderThemeIcon = () => {
		if (currentTheme === "dark") {
			return <Sun className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-yellow-400" />;
		} else {
			return <Moon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-slate-900" />;
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn(
						"h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14",
						"cursor-pointer transition-all duration-200 ease-in-out",
						"hover:scale-110 active:scale-95",
						"rounded-full backdrop-blur-sm",
						"border-2",
						// Light mode styles
						"bg-slate-800 hover:bg-slate-700",
						"border-slate-600 hover:border-slate-500",
						"shadow-lg shadow-slate-900/50",
						// Dark mode styles
						"dark:bg-white hover:dark:bg-gray-100",
						"dark:border-slate-200 dark:hover:border-slate-300",
						"dark:shadow-lg dark:shadow-slate-200/50"
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
					// Light mode styles
					"bg-slate-800 backdrop-blur-sm",
					"border-slate-600",
					"shadow-lg shadow-slate-900/50",
					// Dark mode styles
					"dark:bg-white",
					"dark:border-slate-200",
					"dark:shadow-lg dark:shadow-slate-200/50"
				)}
			>
				<DropdownMenuItem
					onClick={() => setTheme("light")}
					className={cn(
						"flex items-center gap-2",
						"text-xs sm:text-sm md:text-base",
						"py-1 sm:py-2 md:py-3 px-2",
						"rounded-lg cursor-pointer",
						"transition-colors duration-200",
						// Light mode styles
						"hover:bg-slate-700",
						"text-slate-100",
						// Dark mode styles
						"dark:text-slate-900",
						"dark:hover:bg-gray-100"
					)}
				>
					<Sun className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-500" />
					<span>Light</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setTheme("dark")}
					className={cn(
						"flex items-center gap-2",
						"text-xs sm:text-sm md:text-base",
						"py-1 sm:py-2 md:py-3 px-2",
						"rounded-lg cursor-pointer",
						"transition-colors duration-200",
						// Light mode styles
						"hover:bg-slate-700",
						"text-slate-100",
						// Dark mode styles
						"dark:text-slate-900",
						"dark:hover:bg-gray-100"
					)}
				>
					<Moon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-slate-400 dark:text-slate-700" />
					<span>Dark</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setTheme("system")}
					className={cn(
						"flex items-center gap-2",
						"text-xs sm:text-sm md:text-base",
						"py-1 sm:py-2 md:py-3 px-2",
						"rounded-lg cursor-pointer",
						"transition-colors duration-200",
						// Light mode styles
						"hover:bg-slate-700",
						"text-slate-100",
						// Dark mode styles
						"dark:text-slate-900",
						"dark:hover:bg-gray-100"
					)}
				>
					<Laptop className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-slate-500 dark:text-slate-600" />
					<span>System</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
