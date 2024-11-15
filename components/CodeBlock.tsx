'use client';

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
	children: React.ReactNode;
	className?: string;
}

export const CodeBlock = ({ children, className }: CodeBlockProps) => {
	const [isCopied, setIsCopied] = useState(false);
	const code = String(children).trim();

	const handleCopy = async () => {
		await navigator.clipboard.writeText(code);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	return (
		<div className="relative my-4">
			<pre className={cn("overflow-x-auto rounded-md", className)}>
				{children}
			</pre>
			<Button
				onClick={handleCopy}
				variant="ghost"
				size="icon"
				className="absolute top-2 right-2"
			>
				{isCopied ? (
					<Check className="w-4 h-4" />
				) : (
					<Copy className="w-4 h-4" />
				)}
			</Button>
		</div>
	);
};
