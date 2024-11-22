"use client";

import React, { useMemo, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";

interface MathProps {
	children: string;
	display?: boolean;
	options?: katex.KatexOptions;
	number?: number;
	id?: string;
}

export default function Math({
	children = "",
	display = false,
	options = {},
	number,
	id,
}: MathProps) {
	const [copied, setCopied] = useState(false);
	const Wrapper = display ? "div" : "span";

	const handleCopy = async () => {
		await navigator.clipboard.writeText(children);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	if (typeof children !== "string") {
		throw new Error("Children prop must be a katex string");
	}

	const sanitizedChildren = children.replace(/&/g, '\\&');

	const renderedKatex = useMemo(() => {
		let result: string;

		try {
			result = katex.renderToString(sanitizedChildren, {
				...options,
				displayMode: display || children.includes("{align}"),
				throwOnError: true,
				globalGroup: true,
				trust: true,
				strict: false,
			});
		} catch (error) {
			console.error("KaTeX rendering error:", error);
			result = katex.renderToString(sanitizedChildren, {
				...options,
				displayMode: display || children.includes("{align}"),
				throwOnError: false,
				strict: "ignore",
				globalGroup: true,
				trust: true,
			});
		}

		return result;
	}, [sanitizedChildren, display, options, children]);

	return (
		<Wrapper
			id={id}
			className={cn(
				"math",
				display ? "math-display" : "math-inline",
				"group relative w-full"
			)}
		>
			<div
				className="overflow-x-auto"
				dangerouslySetInnerHTML={{ __html: renderedKatex }}
			/>
			{display && (
				<>
					<button
						onClick={handleCopy}
						className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 rounded-md"
						aria-label="Copy equation"
					>
						{copied ? (
							<Check className="h-5 w-5 text-green-500" />
						) : (
							<Copy className="h-5 w-5 text-gray-500 hover:text-gray-700" />
						)}
					</button>
					{number && (
						<span className="equation-number">({number})</span>
					)}
				</>
			)}
		</Wrapper>
	);
}
