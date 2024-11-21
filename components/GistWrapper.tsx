"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import SuperReactGist to avoid SSR issues
const DynamicSuperReactGist = dynamic<SuperReactGistProps>(
	() => import("super-react-gist").then((mod) => mod.default),
	{
		ssr: false, // Disable SSR for this component
		loading: () => <div>Loading gist...</div>,
	}
);

interface GistWrapperProps {
	url?: string;
	id?: string;
}

interface SuperReactGistProps {
	url: string;
}

export default function GistWrapper({ url, id }: GistWrapperProps) {
	// Construct URL if only ID is provided
	const gistUrl = url || `https://gist.github.com/${id}`;

	if (!gistUrl) {
		console.error("GistWrapper requires either a url or id prop");
		return null;
	}

	return (
		<div className="my-4">
			<DynamicSuperReactGist url={gistUrl} />
		</div>
	);
}
