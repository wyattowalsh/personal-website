import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

interface MathProps {
	children?: string;
	display?: boolean;
	options?: katex.KatexOptions;
}

export default function Math({
	children = "",
	display = false,
	options = {},
}: MathProps) {
	const Wrapper = display ? "div" : "span";

	if (typeof children !== "string") {
		throw new Error("Children prop must be a katex string");
	}

	const renderedKatex = useMemo(() => {
		let result: string;

		try {
			result = katex.renderToString(children, {
				...options,
				displayMode: display || children.includes("{align}"),
				throwOnError: true,
				globalGroup: true,
				trust: true,
				strict: false,
			});
		} catch (error) {
			console.error("KaTeX rendering error:", error);
			result = katex.renderToString(children, {
				...options,
				displayMode: display || children.includes("{align}"),
				throwOnError: false,
				strict: "ignore",
				globalGroup: true,
				trust: true,
			});
		}

		return result;
	}, [children, display, options]);

	return (
		<Wrapper
			className={cn(
				display ? "katex-display" : "katex-inline",
				"text-base sm:text-lg md:text-xl lg:text-2xl",
				"[&_.katex]:leading-normal",
				"[&_.katex-html]:leading-normal",
				"dark:[&_.katex]:text-gray-100",
				"[&_.katex]:text-gray-900",
				"[&_.katex]:min-h-[2em]",
				"max-w-full" // Add this line
			)}
			dangerouslySetInnerHTML={{ __html: renderedKatex || "" }}
		/>
	);
}
