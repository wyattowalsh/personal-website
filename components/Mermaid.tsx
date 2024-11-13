// components/Mermaid.tsx

"use client";

import mermaid from "mermaid";
import { useEffect, useRef } from "react";

interface MermaidProps {
	children: string;
}

export default function Mermaid({ children }: MermaidProps) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ref.current) {
			mermaid.initialize({ startOnLoad: true });
			mermaid.contentLoaded();
		}
	}, []);

	return (
		<div className="mermaid" ref={ref} style={{ colorScheme: "light" }}>
			{children}
		</div>
	);
}
