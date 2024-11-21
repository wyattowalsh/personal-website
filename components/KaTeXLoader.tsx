"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function KaTeXLoader() {
	useEffect(() => {
		// @ts-ignore
		if (typeof renderMathInElement !== "undefined") {
			// @ts-ignore
			renderMathInElement(document.body);
		}
	}, []);

	return (
		<>
			<Script
				src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/copy-tex.min.js"
				integrity="sha384-HORx6nWi8j5/mYA+y57/9/CZc5z8HnEw4WUZWy5yOn9ToKBv1l58vJaufFAn9Zzi"
				crossOrigin="anonymous"
				strategy="lazyOnload"
			/>
			<Script
				src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
				integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05"
				crossOrigin="anonymous"
				strategy="lazyOnload"
			/>
		</>
	);
}
