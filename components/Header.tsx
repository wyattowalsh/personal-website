"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { BlogBackLink } from "@/components/BlogBackLink";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { cn } from "@/lib/utils";

export function Header() {
	const pathname = usePathname();
	const isHome = pathname === "/";

	return (
		<header
			className={cn(
				"fixed top-0 left-0 w-full flex justify-between items-center px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-3 z-50",
				isHome
					? "bg-transparent"
					: "bg-background/80 backdrop-blur-md border-b border-border/40"
			)}
		>
			<BlogBackLink />
			<div className="flex items-center space-x-4 ml-auto">
				<DarkModeToggle />
			</div>
		</header>
	);
}
