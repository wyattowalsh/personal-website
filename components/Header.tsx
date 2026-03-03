"use client";

import React from "react";
import Link from "next/link";
import { Palette } from "lucide-react";
import BlogBackLink from "@/components/BlogBackLink";
import DarkModeToggle from "@/components/DarkModeToggle";

export default function Header() {
	return (
		<header
			role="banner"
			aria-label="Site header"
			className="fixed top-0 left-0 w-full flex justify-between items-center px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-3 z-50 bg-background/80 backdrop-blur-md border-b border-border/40"
		>
			<BlogBackLink />
			<div className="flex items-center space-x-4 ml-auto">
				<Link
					href="/studio"
					className="text-foreground/70 hover:text-foreground transition-colors"
					aria-label="Studio"
				>
					<Palette className="h-5 w-5" />
				</Link>
				<DarkModeToggle />
			</div>
		</header>
	);
}
