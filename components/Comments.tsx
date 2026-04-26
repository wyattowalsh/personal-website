"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

const Giscus = dynamic(() => import("@giscus/react"), {
	ssr: false,
	loading: () => <div className="min-h-24 rounded-lg border border-border/40 bg-muted/20" />,
});

export function Comments() {
	const { resolvedTheme } = useTheme();
	const sectionRef = useRef<HTMLElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	// Capture the initial theme so the Giscus component mounts once and never
	// re-renders due to a theme prop change. All subsequent theme switches are
	// handled exclusively via the postMessage API below.
	const initialTheme = useRef(resolvedTheme === "dark" ? "dark" : "light");

	const sendThemeMessage = useCallback((theme: string): boolean => {
		const iframe = document.querySelector<HTMLIFrameElement>(
			'iframe.giscus-frame'
		);
		if (!iframe?.contentWindow) return false;
		iframe.contentWindow.postMessage(
			{ giscus: { setConfig: { theme } } },
			'https://giscus.app'
		);
		return true;
	}, []);

	useEffect(() => {
		if (isVisible) return;
		const node = sectionRef.current;
		if (!node) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "600px 0px" },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [isVisible]);

	useEffect(() => {
		if (!isVisible) return;
		// Update theme in the existing Giscus iframe without remounting
		const theme = resolvedTheme === "dark" ? "dark" : "light";
		const sent = sendThemeMessage(theme);
		if (!sent) {
			// Iframe not ready — observe for it
			const observer = new MutationObserver(() => {
				const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
				if (iframe) {
					sendThemeMessage(theme);
					observer.disconnect();
				}
			});
			if (sectionRef.current) {
				observer.observe(sectionRef.current, { childList: true, subtree: true });
				const timeout = setTimeout(() => observer.disconnect(), 10_000);
				return () => { clearTimeout(timeout); observer.disconnect(); };
			}
		}
	}, [isVisible, resolvedTheme, sendThemeMessage]);

	return (
		<section ref={sectionRef} className="min-h-24">
			{isVisible ? (
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
			) : null}
		</section>
	);
}
