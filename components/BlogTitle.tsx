"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import { useTheme } from "next-themes";
import {
	Code,
	Binary,
	Terminal,
	Brain,
	Sparkles,
	CircuitBoard,
	Cpu,
	Database,
	Cloud,
	Network,
	Github,
	Chrome,
	Command,
	Server,
	Share2,
	Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import styles from './blogtitle.module.scss';

const icons = [
	Code,
	Binary,
	Terminal,
	Brain,
	Sparkles,
	CircuitBoard,
	Cpu,
	Database,
	Cloud,
	Network,
	Github,
	Chrome,
	Command,
	Server,
	Share2,
	Workflow,
];

const FloatingIcon = ({
	icon: Icon,
	containerSize,
}: {
	icon: React.ComponentType<{ className?: string }>;
	containerSize: { width: number; height: number };
}) => {
	const iconSize = 16;

	const x = useMotionValue(
		Math.random() * containerSize.width - containerSize.width / 2
	);
	const y = useMotionValue(
		Math.random() * containerSize.height - containerSize.height / 2
	);

	const velocity = useRef({
		x: (Math.random() - 0.5) * 80,
		y: (Math.random() - 0.5) * 80,
	});

	const rotationZ = useMotionValue(Math.random() * 360);

	useAnimationFrame((_, delta) => {
		const deltaInSeconds = delta / 1000;

		let newX = x.get() + velocity.current.x * deltaInSeconds;
		let newY = y.get() + velocity.current.y * deltaInSeconds;

		const boundsX = containerSize.width / 2 - iconSize;
		const boundsY = containerSize.height / 2 - iconSize;

		if (Math.abs(newX) > boundsX) {
			velocity.current.x *= -1;
			newX = Math.sign(newX) * boundsX;
		}
		if (Math.abs(newY) > boundsY) {
			velocity.current.y *= -1;
			newY = Math.sign(newY) * boundsY;
		}

		x.set(newX);
		y.set(newY);

		rotationZ.set((rotationZ.get() + 60 * deltaInSeconds) % 360);
	});

	return (
		<motion.div
			style={{
				x,
				y,
				rotateZ: rotationZ,
				marginLeft: -iconSize / 2,
				marginTop: -iconSize / 2,
			}}
			className="absolute left-1/2 top-1/2"
		>
			<Icon className="w-4 h-4 text-cyan-600/70 dark:text-cyan-400/70 drop-shadow-md" />
		</motion.div>
	);
};

const GlitchText = ({ children }: { children: React.ReactNode }) => (
	<motion.div
		className={cn(
			"relative inline-block",
			styles['glitch-container'],
			"animate-glitch-text"
		)}
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		transition={{ duration: 0.3 }}
	>
		 {/* Main text layer */}
		<span 
			className={cn(
				"relative z-10",
				styles['glitch-text'],
				"bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500",
				"bg-clip-text text-transparent",
				"animate-glitch-skew"
			)}
			data-text={children}
		>
			{children}
		</span>

		{/* Glitch effect layers */}
		<span className={styles['glitch-copy-1']} aria-hidden="true">{children}</span>
		<span className={styles['glitch-copy-2']} aria-hidden="true">{children}</span>
		
		{/* Scanlines */}
		<div className={styles['scanlines']}></div>
		
		{/* Cyber decorations */}
		<div className={styles['cyber-brackets']}></div>
	</motion.div>
);

const BackgroundParticles = () => {
	const particles = Array.from({ length: 100 });

	return (
		<>
			{particles.map((_, index) => (
				<motion.div
					key={index}
					className="absolute rounded-full bg-cyan-500/20 dark:bg-cyan-400/20 blur-md"
					style={{
						width: `${Math.random() * 4 + 2}px`,
						height: `${Math.random() * 4 + 2}px`,
						top: `${Math.random() * 100}%`,
						left: `${Math.random() * 100}%`,
					}}
					animate={{
						opacity: [0, 1, 0],
						y: [0, -50, 0],
						x: [0, 20 * (Math.random() - 0.5), 0],
					}}
					transition={{
						duration: 5 + Math.random() * 5,
						repeat: Infinity,
						delay: Math.random() * 5,
						ease: "easeInOut",
					}}
				/>
			))}
		</>
	);
};

const AnimatedBackground = () => (
	<div className="absolute inset-0 z-0 overflow-hidden">
		<motion.div
			className="absolute inset-0"
			animate={{
				backgroundPosition: ["0% 50%", "100% 50%"],
			}}
			transition={{
				duration: 30,
				repeat: Infinity,
				ease: "linear",
			}}
			style={{
				backgroundImage: "linear-gradient(270deg, #00FFFF, #FF00FF, #00FFFF)",
				backgroundSize: "600% 600%",
			}}
		/>
	</div>
);

const BlogTitle = () => {
	const { theme } = useTheme();
	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const updateSize = () => {
			const container = document.getElementById("title-container");
			if (container) {
				const { width, height } = container.getBoundingClientRect();
				setContainerSize({ width, height });
			}
		};
		updateSize();
		window.addEventListener("resize", updateSize);
		return () => window.removeEventListener("resize", updateSize);
	}, []);

	return (
		<motion.div className="relative w-full py-2 sm:py-3 md:py-4 overflow-hidden pt-0" suppressHydrationWarning>
			<div className="max-w-4xl mx-auto mt-0">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
				>
					<Card
						id="title-container"
						className={cn(
							"relative rounded-2xl overflow-hidden perspective-1000",
							"p-6 sm:p-8 md:p-12",
							"backdrop-blur-[20px]",
							"bg-gradient-to-br from-black/40 via-black/60 to-black/40",
							"dark:from-white/10 dark:via-white/20 dark:to-white/10",
							"border border-cyan-500/20 dark:border-cyan-400/20",
							"shadow-[0_0_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(255,255,255,0.1)]",
							styles['card-container']
						)}
					>
						<div className={styles['cyber-grid']}></div>
						<BackgroundParticles />
						<div className={styles.scanlines} />

						{containerSize.width > 0 &&
							icons.map((Icon, index) => (
								<FloatingIcon
									key={index}
									icon={Icon}
									containerSize={containerSize}
								/>
							))}

						<div className="relative z-10 text-center">
							<motion.h1
								className={cn(
									"text-4xl sm:text-5xl md:text-6xl font-bold",
									"p-2 select-none",
									"filter drop-shadow-[0_0_8px_rgba(0,255,255,0.3)]",
									styles['title']
								)}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.8,
									delay: 0.2,
									ease: [0.6, -0.05, 0.01, 0.99]
								}}
							>
								<GlitchText>onelonedatum</GlitchText>
							</motion.h1>
						</div>
					</Card>
				</motion.div>
			</div>
		</motion.div>
	);
};

export default BlogTitle;
