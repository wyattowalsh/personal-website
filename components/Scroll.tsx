"use client";

import React, { useEffect, useState } from "react";
import { animateScroll } from "react-scroll";
import { cn } from "@/lib/utils";

const CustomScrollbars = ({ children }: { children: React.ReactNode }) => {
	const [showButton, setShowButton] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setShowButton(window.scrollY > 300);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToTop = () => {
		animateScroll.scrollToTop({
			duration: 500,
			smooth: "easeInOutQuint",
		});
	};

	return (
		<div
			className={cn(
				"relative min-h-full",
				// Custom Scrollbar Base Styles
				"[&::-webkit-scrollbar]:w-2",
				"[&::-webkit-scrollbar]:h-2",
				// Track Styles
				"[&::-webkit-scrollbar-track]:bg-gradient-to-r from-purple-400 via-pink-500 to-red-500",
				"[&::-webkit-scrollbar-track]:rounded-full",
				"dark:[&::-webkit-scrollbar-track]:bg-gradient-to-r from-purple-700 via-pink-700 to-red-700",
				// Thumb Styles
				"[&::-webkit-scrollbar-thumb]:bg-gradient-to-r from-green-400 via-blue-500 to-purple-500",
				"dark:[&::-webkit-scrollbar-thumb]:bg-gradient-to-r from-green-700 via-blue-700 to-purple-700",
				"[&::-webkit-scrollbar-thumb]:rounded-full",
				"[&::-webkit-scrollbar-thumb]:border-4",
				"[&::-webkit-scrollbar-thumb]:border-transparent",
				// Hover Effects
				"[&::-webkit-scrollbar-thumb:hover]:bg-gradient-to-r from-green-500 via-blue-600 to-purple-600",
				"dark:[&::-webkit-scrollbar-thumb:hover]:bg-gradient-to-r from-green-800 via-blue-800 to-purple-800",
				// Corner Styles
				"[&::-webkit-scrollbar-corner]:bg-transparent",
				// Responsive
				"sm:[&::-webkit-scrollbar]:w-3",
				"sm:[&::-webkit-scrollbar]:h-3",
				"lg:[&::-webkit-scrollbar]:w-4",
				"lg:[&::-webkit-scrollbar]:h-4"
			)}
			style={{
				scrollBehavior: "smooth",
				WebkitOverflowScrolling: "touch",
			}}
		>
			{children}
			{showButton && (
				<button
					onClick={scrollToTop}
					className={cn(
						// Base styles
						"fixed z-50 p-3 rounded-full shadow-lg backdrop-blur-sm",
						"bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8",
						// Colors & Effects
						"bg-gray-100/80 dark:bg-gray-800/80",
						"hover:bg-gray-200/90 dark:hover:bg-gray-700/90",
						"text-gray-700 dark:text-gray-300",
						// Transitions
						"transition-all duration-300 ease-in-out",
						"hover:scale-110 active:scale-95",
						// Ring effect on focus
						"focus:outline-none focus-visible:ring-2",
						"focus-visible:ring-primary/50 dark:focus-visible:ring-primary/50",
						// Responsive sizes
						"w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
					)}
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
