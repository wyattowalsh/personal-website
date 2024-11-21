import { useEffect, useState, useCallback } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, Engine } from "@tsparticles/engine";
import { loadAll } from "@tsparticles/all";
import { getRandomConfigUrl } from "@/components/particles/particlesConfig";
import { useTheme } from "next-themes";

export default function ParticlesBackground() {
	const [init, setInit] = useState(false);
	const { theme, systemTheme } = useTheme();
	const currentTheme = theme === "system" ? systemTheme : theme;

	useEffect(() => {
		const initEngine = async () => {
			await initParticlesEngine(async (engine: Engine) => {
				await loadAll(engine);
			});
			setInit(true);
		};
		initEngine();
	}, []);

	const particlesLoaded = useCallback(async (container?: Container) => {
		if (container) {
			console.log("Particles container loaded", container);
		}
	}, []);

	if (!init) {
		return null;
	}

	return (
		<Particles
			id="tsparticles"
			className="absolute inset-0 -z-10"
			url={getRandomConfigUrl(currentTheme === "dark" ? "dark" : "light")}
			particlesLoaded={particlesLoaded}
		/>
	);
}
