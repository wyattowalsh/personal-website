"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Comments() {
	const { resolvedTheme } = useTheme();
	const [giscusTheme, setGiscusTheme] = useState("/giscus-light.css");

	useEffect(() => {
		if (resolvedTheme === "dark") {
			setGiscusTheme("/giscus-dark.css");
		} else {
			setGiscusTheme("/giscus-light.css");
		}
	}, [resolvedTheme]);

	return (
		<section key={giscusTheme}>
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
