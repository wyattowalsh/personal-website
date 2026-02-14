"use client";

import React from "react";
import { usePathname } from "next/navigation";
import BlogBackLink from "@/components/BlogBackLink";
import DarkModeToggle from "@/components/DarkModeToggle";

export default function Header() {
	const pathname = usePathname();
	const isBlogPage = pathname.startsWith("/blog");

	return (
		<header
			role="banner"
			aria-label="Site header"
			className="fixed top-0 left-0 w-full flex justify-between items-center px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 z-50 bg-transparent"
		>
			<BlogBackLink />
			<div className="flex items-center space-x-4">
				<DarkModeToggle />
			</div>
		</header>
	);
}
