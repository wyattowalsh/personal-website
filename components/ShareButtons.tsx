"use client";

import { useState } from "react";
import {
	TwitterShareButton,
	LinkedinShareButton,
	FacebookShareButton,
	TwitterIcon,
	LinkedinIcon,
	FacebookIcon,
} from "react-share";
import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
	url: string;
	title: string;
	description?: string;
	className?: string;
}

export function ShareButtons({
	url,
	title,
	description,
	className,
}: ShareButtonsProps) {
	const [copied, setCopied] = useState(false);

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy link:", error);
		}
	};

	const iconSize = 32;
	const iconBorderRadius = 8;

	return (
		<div className={cn("flex items-center gap-3", className)}>
			<TwitterShareButton url={url} title={title}>
				<TwitterIcon size={iconSize} round={false} borderRadius={iconBorderRadius} />
			</TwitterShareButton>

			<LinkedinShareButton url={url} title={title} summary={description}>
				<LinkedinIcon size={iconSize} round={false} borderRadius={iconBorderRadius} />
			</LinkedinShareButton>

			<FacebookShareButton url={url} hashtag="#tech">
				<FacebookIcon size={iconSize} round={false} borderRadius={iconBorderRadius} />
			</FacebookShareButton>

			<button
				onClick={handleCopyLink}
				className={cn(
					"inline-flex items-center justify-center",
					"w-8 h-8 rounded-lg",
					"bg-muted hover:bg-muted/80",
					"transition-colors duration-200",
					"focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
				)}
				aria-label="Copy link"
				title="Copy link"
			>
				{copied ? (
					<Check className="w-4 h-4 text-green-500" />
				) : (
					<Link2 className="w-4 h-4 text-foreground" />
				)}
			</button>
		</div>
	);
}
