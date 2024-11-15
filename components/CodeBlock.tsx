// components/CodeBlock.tsx

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/cjs/styles/prism/one-dark";

interface CodeBlockProps {
	className?: string;
	children: React.ReactNode;
}

export const CodeBlock = ({ className, children }: CodeBlockProps) => {
	const match = /language-(\w+)/.exec(className || "");
	const language = match ? match[1] : "";

	return (
		<SyntaxHighlighter
			style={oneDark}
			language={language}
			PreTag="div"
			className="codeStyle"
		>
			{String(children).replace(/\n$/, "")}
		</SyntaxHighlighter>
	);
};
