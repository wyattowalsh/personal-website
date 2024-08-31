"use client";

import {
	faCodepen,
	faGithub,
	faKaggle,
	faLinkedin,
	faMedium,
	faSpotify,
	faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
	faEnvelope
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const links = [
	{
		name: "GitHub",
		url: "https://www.github.com/wyattowalsh",
		icon: faGithub,
		color: "#181717",
	},
	{
		name: "LinkedIn",
		url: "https://www.linkedin.com/in/wyattowalsh",
		icon: faLinkedin,
		color: "#0A66C2",
	},
	{
		name: "X",
		url: "https://www.x.com/wyattowalsh",
		icon: faXTwitter,
		color: "#000000",
	},
	{
		name: "Medium",
		url: "https://www.medium.com/@wyattowalsh",
		icon: faMedium,
		color: "#000000",
	},
	{
		name: "Kaggle",
		url: "https://www.kaggle.com/wyattowalsh",
		icon: faKaggle,
		color: "#20BEFF",
	},
	{
		name: "Spotify",
		url: "https://www.spotify.com/wyattowalsh",
		icon: faSpotify,
		color: "#1DB954",
	},
	{
		name: "CodePen",
		url: "https://codepen.io/wyattowalsh",
		icon: faCodepen,
		color: "#000000",
	},
	{
		name: "Email",
		url: "mailto:wyattowalsh@gmail.com",
		icon: faEnvelope,
		color: "#6a9fb5",
	},
];

const containerVariants = {
	hidden: { opacity: 1 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, rotateX: -90, transformOrigin: "bottom left" },
	visible: {
		opacity: 1,
		rotateX: 0,
		transformOrigin: "bottom left",
		transition: { duration: 0.5, ease: "easeOut" },
	},
};

export default function Home() {
	const [isAboutModalOpen, setAboutModalOpen] = useState(false);
	const aboutButtonRef = useRef<HTMLButtonElement>(null);
	const knowledgeBaseButtonRef = useRef<HTMLAnchorElement>(null);

	useEffect(() => {
		if (aboutButtonRef.current && knowledgeBaseButtonRef.current) {
			const aboutButtonWidth = aboutButtonRef.current.offsetWidth;
			const knowledgeBaseButtonWidth =
				knowledgeBaseButtonRef.current.offsetWidth;

			if (aboutButtonWidth < knowledgeBaseButtonWidth) {
				aboutButtonRef.current.style.width = `${knowledgeBaseButtonWidth}px`;
			}
		}
	}, []);

	useEffect(() => {
		if (isAboutModalOpen) {
			const modalContent = document.querySelector(".modal-content");
			if (modalContent) {
				modalContent.classList.remove("entering");
				modalContent.classList.add("entered");
			}
		}
	}, [isAboutModalOpen]);

	return (
		<main className="relative flex min-h-screen flex-col items-center justify-start p-4 sm:p-8 md:p-24">
			<div className="absolute inset-0">
				<div className="fancy-bg" />
			</div>
			<div className="relative flex justify-center w-full">
				<Image
					className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40"
					src="/logo.png"
					alt="Logo — Wyatt Walsh"
					width={120}
					height={120}
					priority
					sizes="(max-width: 640px) 100px, (max-width: 768px) 120px, (max-width: 1024px) 120px, 130px"
				/>
			</div>

			<div className="text-center mt-16 relative z-10">
				<h1 className="text-4xl font-bold">Wyatt Walsh</h1>
				<div className="mt-8 space-y-4">
					{/* <a
						ref={knowledgeBaseButtonRef}
						href="https://www.w4w.dev/kb"
						className="button button-secondary"
					>
						<FontAwesomeIcon icon={faBook} className="mr-2" />
						Knowledge Base
					</a> */}
					<motion.div
						className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
					>
						{links.map((link) => (
							<motion.a
								key={link.name}
								href={link.url}
								className="flex items-center justify-center p-4 card space-x-2"
								variants={itemVariants}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
							>
								<FontAwesomeIcon
									icon={link.icon}
									style={{ color: link.color }}
								/>
								<span>{link.name}</span>
							</motion.a>
						))}
					</motion.div>
				</div>
			</div>

			{isAboutModalOpen && (
				<div className="modal-overlay">
					<div className="modal-content entering">
						<button
							className="modal-close-button"
							onClick={() => setAboutModalOpen(false)}
						>
							&times;
						</button>
						<h2>About Wyatt Walsh</h2>
						{/* <p>Placeholder for about section content...</p> */}
					</div>
				</div>
			)}
		</main>
	);
}
