// components/CodeBlock.tsx

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface CodeBlockProps {
	className?: string;
	children: React.ReactNode;
}

export const CodeBlock = ({ className, children }: CodeBlockProps) => {
	const language = className?.replace(/language-/, "") || "text";

	return (
		<SyntaxHighlighter language={language} style={dracula}>
			{String(children).trim()}
		</SyntaxHighlighter>
	);
};
