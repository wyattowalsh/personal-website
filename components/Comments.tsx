"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";

export function Comments() {
	const { theme } = useTheme();

	return (
		<section className="mt-8">
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
				theme={`/giscus.css`}
				lang="en"
				loading="lazy"
			/>
		</section>
	);
}
