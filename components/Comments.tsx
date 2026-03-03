"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function Comments() {
	const { resolvedTheme } = useTheme();

	useEffect(() => {
		// Send theme change message to Giscus iframe
		const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
		if (iframe && iframe.contentWindow) {
			const theme = resolvedTheme === "dark" ? "dark" : "light";
			iframe.contentWindow.postMessage(
				{ giscus: { setConfig: { theme } } },
				'https://giscus.app'
			);
		}
	}, [resolvedTheme]);

	return (
		<section>
			<Giscus
				id="comments"
				repo="wyattowalsh/personal-website"
				repoId="MDEwOlJlcG9zaXRvcnkxNTgxOTI2MDk="
				category="General"
				categoryId="DIC_kwDOCW3T4c4CkPJr"
				mapping="pathname"
				strict="0"
				reactionsEnabled="1"
				emitMetadata="1"
				inputPosition="bottom"
				theme={resolvedTheme === "dark" ? "dark" : "light"}
				lang="en"
				loading="lazy"
			/>
		</section>
	);
}
