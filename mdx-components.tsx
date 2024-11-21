import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import React from "react";

// Corrected import paths for shadcn/ui components
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip } from "@/components/ui/tooltip";

// Custom components and hooks
import GistWrapper from "@/components/GistWrapper";
import ClientSideLink from "@/components/ClientSideLink";
import TagLink from "@/components/TagLink";
import Math from "@/components/Math";

// Update or add the GistWrapper props type definition
type GistWrapperProps = {
	url: string;
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		// Headings with gradient text using SCSS variables
		h1: ({ children }) => (
			<h1
				className={cn(
					"text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-8",
					"bg-gradient-to-r from-[var(--gradient-heading-start)] via-[var(--gradient-heading-middle)] to-[var(--gradient-heading-end)]",
					"bg-clip-text text-transparent animate-gradient"
				)}
			>
				{children}
			</h1>
		),

		h2: ({ children }) => (
			<h2
				className={cn(
					"text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mt-8 mb-6",
					"bg-gradient-to-r from-[var(--gradient-text-start)] via-[var(--gradient-text-middle)] to-[var(--gradient-text-end)]",
					"bg-clip-text text-transparent"
				)}
			>
				{children}
			</h2>
		),

		h3: ({ children }) => (
			<h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight mt-6 mb-4">
				{children}
			</h3>
		),

		h4: ({ children }) => (
			<h4 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight mt-4 mb-2">
				{children}
			</h4>
		),

		// Math component with enhanced styling
		Math: ({ children, display }) => (
			<div className="my-8 not-prose">
				<div
					className={cn(
						"relative",
						"px-6 py-8 sm:px-8 sm:py-10",
						"bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50",
						"dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-900",
						"rounded-2xl shadow-xl",
						"transition-all duration-300",
						"hover:shadow-2xl hover:scale-[1.02]",
						"dark:shadow-gray-900/60",
						"flex justify-center",
						"w-full"
					)}
				>
					<Math display={display}>{children}</Math>
				</div>
			</div>
		),

		// Code blocks with custom styling and copy-to-clipboard button
		pre: ({ children, className, ...props }) => (
			<div className="not-prose my-8 relative group">
				<pre
					className={cn(
						"relative rounded-2xl overflow-x-auto",
						"p-4 sm:p-6 md:p-8",
						"bg-gradient-to-br from-gray-900 to-gray-950",
						"dark:from-gray-800 dark:to-gray-900",
						"shadow-xl dark:shadow-gray-900/60",
						"transition-all duration-300",
						"group-hover:shadow-2xl group-hover:scale-[1.02]",
						"text-sm sm:text-base md:text-lg",
						"font-mono",
						className
					)}
					{...props}
				>
					{children}
				</pre>
				<button
					className={cn(
						"absolute top-4 right-4",
						"opacity-0 group-hover:opacity-100",
						"transition-all duration-200",
						"bg-gradient-to-r from-blue-500 to-purple-500",
						"dark:from-green-400 dark:to-emerald-600",
						"text-white rounded-lg",
						"px-3 py-2 text-sm",
						"hover:scale-110",
						"shadow-lg"
					)}
					onClick={() => {
						navigator.clipboard.writeText(children.props.children);
					}}
				>
					Copy
				</button>
			</div>
		),

		// Custom components marked as not-prose
		Gist: ({ url }: GistWrapperProps) => (
			<div className="not-prose my-8">
				<GistWrapper url={url} />
			</div>
		),

		// Use of SCSS variables for consistent colors and themes
		strong: ({ children }) => (
			<strong
				className={cn(
					"font-bold",
					"bg-gradient-to-r from-[var(--strong-gradient-start)] via-[var(--strong-gradient-middle)] to-[var(--strong-gradient-end)]",
					"bg-clip-text text-transparent animate-gradient"
				)}
			>
				{children}
			</strong>
		),

		// Simplify links with consistent hover effects
		a: ({ href, children }) => {
			if (!href) return <span>{children}</span>;
			const isExternal = href.startsWith("http") || href.startsWith("//");
			const LinkComponent = isExternal ? ClientSideLink : Link;
			return (
				<LinkComponent href={href}>
					<span
						className={cn(
							"relative inline-block text-primary hover:underline",
							"after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full",
							"after:bg-current after:scale-x-0 after:origin-bottom-right",
							"hover:after:scale-x-100 hover:after:origin-bottom-left",
							"after:transition-transform after:duration-300"
						)}
					>
						{children}
					</span>
				</LinkComponent>
			);
		},

		// Let prose handle basic elements with enhanced styles
		p: ({ children }) => (
			<p className="leading-relaxed text-base sm:text-lg md:text-xl">
				{children}
			</p>
		),

		ul: ({ children }) => (
			<ul className="list-disc list-inside ml-4">{children}</ul>
		),

		ol: ({ children }) => (
			<ol className="list-decimal list-inside ml-4">{children}</ol>
		),

		li: ({ children }) => <li className="mb-2">{children}</li>,

		blockquote: ({ children }) => (
			<blockquote
				className={cn(
					"border-l-4",
					"bg-gradient-to-br from-gray-50 to-gray-100",
					"dark:from-gray-800 dark:to-gray-900",
					"pl-6 pr-4 py-4 my-6",
					"rounded-r-xl",
					"shadow-lg dark:shadow-gray-900/40",
					"transition-all duration-300",
					"hover:shadow-xl hover:scale-[1.01]",
					"italic text-gray-700 dark:text-gray-300"
				)}
			>
				{children}
			</blockquote>
		),

		img: ({ src, alt }) => (
			<figure className="my-8">
				<img
					src={src}
					alt={alt}
					className="rounded-xl shadow-lg dark:shadow-gray-900/50"
				/>
				{alt && (
					<figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
						{alt}
					</figcaption>
				)}
			</figure>
		),

		// Simplified component structures using shadcn/ui components
		Alert: (props) => (
			<div className="my-4">
				<Alert {...props} />
			</div>
		),

		Badge: (props) => (
			<Badge
				{...props}
				className={cn(
					props.className,
					"bg-gradient-to-r from-[var(--badge-gradient-start)] via-[var(--badge-gradient-middle)] to-[var(--badge-gradient-end)]",
					"text-[var(--badge-text-color)]"
				)}
			/>
		),

		Button: (props) => (
			<Button
				{...props}
				className={cn(
					props.className,
					"hover:scale-105 transition-transform duration-300"
				)}
			/>
		),

		Card: (props) => (
			<div className="my-4">
				<Card {...props} />
			</div>
		),

		Tooltip,
		ClientSideLink,
		TagLink,
		...components,
	};
}
