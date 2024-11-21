// components/DarkModeToggle.tsx

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
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
			return <Moon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />;
		} else {
			return <Sun className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />;
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 cursor-pointer 
                               hover:bg-gray-200 dark:hover:bg-gray-700 
                               transition-all duration-200 ease-in-out
                               hover:scale-110 active:scale-95
                               shadow-lg dark:shadow-gray-800"
				>
					{renderThemeIcon()}
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="min-w-[120px] sm:min-w-[140px] md:min-w-[160px] p-2 sm:p-3 md:p-4
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           rounded-lg shadow-md dark:shadow-gray-700"
			>
				<DropdownMenuItem
					onClick={() => setTheme("light")}
					className="text-xs sm:text-sm md:text-base py-1 sm:py-2 md:py-3
                               hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
				>
					<Sun className="mr-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
					<span>Light</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setTheme("dark")}
					className="text-xs sm:text-sm md:text-base py-1 sm:py-2 md:py-3
                               hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
				>
					<Moon className="mr-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
					<span>Dark</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setTheme("system")}
					className="text-xs sm:text-sm md:text-base py-1 sm:py-2 md:py-3
                               hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
				>
					<Laptop className="mr-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
					<span>System</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
