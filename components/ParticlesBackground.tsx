"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container } from "@tsparticles/engine";
import { loadAll } from "@tsparticles/all";
import { getRandomConfigUrl } from "@/components/particles/particlesConfig";
import { useTheme } from "next-themes";

export default function ParticlesBackground() {
	const [init, setInit] = useState(false);
	const { theme } = useTheme();

	useEffect(() => {
		initParticlesEngine(async (engine) => {
			await loadAll(engine);
		}).then(() => {
			setInit(true);
		});
	}, []);

	const particlesLoaded = async (container?: Container): Promise<void> => {
		console.log(container);
		return Promise.resolve();
	};

	if (init) {
		return (
			<Particles
				id="tsparticles"
				className="absolute inset-0 -z-10"
				url={getRandomConfigUrl(theme === "dark" ? "dark" : "light")}
				particlesLoaded={particlesLoaded}
			/>
		);
	}

	return <></>;
}
