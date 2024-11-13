// components/MDXContentRenderer.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useMDXComponents } from "@/components/MDXComponents";
import dynamic from "next/dynamic";

export default function MDXContentRenderer({ slug }: { slug: string }) {
	const [MDXContent, setMDXContent] = useState<React.ComponentType | null>(
		null
	);
	const components = useMDXComponents();

	useEffect(() => {
		let isMounted = true;
		import(`@/posts/${slug}/index.mdx`).then((mod) => {
			if (isMounted) {
				setMDXContent(() => mod.default);
			}
		});
		return () => {
			isMounted = false;
		};
	}, [slug]);

	if (!MDXContent) {
		return <div>Loading...</div>;
	}

	return <MDXContent components={components} />;
}
