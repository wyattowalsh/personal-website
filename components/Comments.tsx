"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef } from "react";

export default function Comments() {
	const { resolvedTheme } = useTheme();

	// Capture the initial theme so the Giscus component mounts once and never
	// re-renders due to a theme prop change. All subsequent theme switches are
	// handled exclusively via the postMessage API below.
	const initialTheme = useRef(resolvedTheme === "dark" ? "dark" : "light");

	const sendThemeMessage = useCallback((theme: string) => {
		const iframe = document.querySelector<HTMLIFrameElement>(
			'iframe.giscus-frame'
		);
		iframe?.contentWindow?.postMessage(
			{ giscus: { setConfig: { theme } } },
			'https://giscus.app'
		);
	}, []);

	useEffect(() => {
		// Update theme in the existing Giscus iframe without remounting
		const theme = resolvedTheme === "dark" ? "dark" : "light";
		sendThemeMessage(theme);
	}, [resolvedTheme, sendThemeMessage]);

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
				theme={initialTheme.current}
				lang="en"
				loading="lazy"
			/>
		</section>
	);
}
