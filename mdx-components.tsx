// mdx-components.tsx

import type { MDXComponents } from "mdx/types";
import Image, { ImageProps } from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DetailedHTMLProps, ImgHTMLAttributes } from "react";

// Import shadcn/ui components
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

import React from "react";

// Update or add the GistWrapper props type definition
type GistWrapperProps = {
	url: string;
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		// Root wrapper for prose
		wrapper: ({ children }) => (
			<div className="prose prose-lg dark:prose-invert prose-headings:scroll-m-20 prose-headings:tracking-tight prose-pre:p-0 prose-pre:bg-transparent prose-img:rounded-lg prose-img:shadow-md dark:prose-img:shadow-gray-900/30 max-w-none">
				{children}
			</div>
		),

		// Headings with gradient
		h1: ({ children }) => (
			<h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
				{children}
			</h1>
		),
		h2: ({ children }) => (
			<h2 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
				{children}
			</h2>
		),

		// Math component with proper spacing
		Math: ({ children, display }) => (
			<div className="my-8 not-prose">
				<div
					className={cn(
						"relative",
						"px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10",
						"bg-gray-50 dark:bg-gray-900",
						"rounded-lg shadow-lg",
						"transition-all duration-200",
						"hover:shadow-xl",
						"dark:shadow-gray-900/50",
						"flex justify-center",
						"w-full"
					)}
				>
					<Math display={display}>{children}</Math>
				</div>
			</div>
		),

		// Code blocks with custom styling
		pre: ({ children, className, ...props }) => (
			<div className="not-prose my-8">
				<pre
					className={cn(
						"relative rounded-lg",
						"p-4 sm:p-6 md:p-8 lg:p-10",
						"bg-gray-950 text-gray-100 dark:bg-gray-900 dark:text-gray-200",
						"shadow-lg dark:shadow-gray-900/50",
						"transition-all duration-200",
						"hover:shadow-xl",
						"text-sm sm:text-base md:text-lg",
						className
					)}
					{...props}
				>
					{children}
				</pre>
			</div>
		),

		// Custom components marked as not-prose
		Gist: ({ url }: { url: string }) => (
			<div className="not-prose my-8">
				<GistWrapper url={url} />
			</div>
		),

		// Keep other component overrides that need custom styling
		strong: ({ children }) => (
			<strong className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
				{children}
			</strong>
		),

		// Let prose handle basic elements
		p: ({ children }) => <p>{children}</p>,
		a: ({ href, children }) => {
			if (!href) return <span>{children}</span>;
			const isExternal = href.startsWith("http") || href.startsWith("//");
			const LinkComponent = isExternal ? ClientSideLink : Link;
			return <LinkComponent href={href}>{children}</LinkComponent>;
		},

		// Include other custom components
		Alert,
		Badge,
		Button,
		Card,
		Tooltip,
		ClientSideLink,
		TagLink,
		...components,
	};
}
