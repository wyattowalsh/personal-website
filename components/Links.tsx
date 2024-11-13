"use client";

import { motion } from "framer-motion";
import SocialLink from "./SocialLink";
import { links } from "../data/links";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Links() {
	return (
		<TooltipProvider>
			<motion.div
				className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
				initial="hidden"
				animate="visible"
				variants={{
					hidden: { opacity: 0, y: 20 },
					visible: {
						opacity: 1,
						y: 0,
						transition: {
							staggerChildren: 0.1,
						},
					},
				}}
			>
				{links.map((link) => (
					<SocialLink key={link.name} link={link} />
				))}
			</motion.div>
		</TooltipProvider>
	);
}
