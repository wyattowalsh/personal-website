"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Links from "@/components/Links";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Page() {
	return (
		<main className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 overflow-hidden">
			<motion.div
				className="absolute inset-0"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { duration: 1 } }}
			>
				<div className="fancy-bg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient" />
			</motion.div>
			<div className="relative flex flex-col items-center justify-center w-full z-10 space-y-4">
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 1 }}
					className="flex items-center justify-center"
				>
					<Image
						className="rounded-full shadow-xl w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40"
						src="/logo.webp"
						alt="Logo — Wyatt Walsh"
						width={120}
						height={120}
						priority
						sizes="(max-width: 640px) 100px, (max-width: 768px) 120px, (max-width: 1024px) 120px, 130px"
					/>
				</motion.div>
				<motion.h1
					className="enhanced-title text-center"
					initial={{ opacity: 0, y: -50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, delay: 0.5 }}
					whileHover={{ scale: 1.05 }}
				>
					Wyatt Walsh
				</motion.h1>
				<Separator className="enhanced-separator" />
				<Links />
			</div>
		</main>
	);
}
