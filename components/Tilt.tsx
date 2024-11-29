"use client";

import { useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltProps {
	children: React.ReactNode;
	className?: string;
	tiltAmount?: number;
	perspective?: number;
	scale?: number;
}

export default function Tilt({
	children,
	className,
	tiltAmount = 20,
	perspective = 1000,
	scale = 1.05,
}: TiltProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [isHovered, setIsHovered] = useState(false);

	const rotateX = useSpring(0, { stiffness: 400, damping: 30 });
	const rotateY = useSpring(0, { stiffness: 400, damping: 30 });
	const scaleValue = useSpring(1, { stiffness: 400, damping: 30 });

	function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
		if (!ref.current) return;

		const rect = ref.current.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;
		const x = (mouseX - width / 2) / width;
		const y = (mouseY - height / 2) / height;

		rotateX.set(-y * tiltAmount);
		rotateY.set(x * tiltAmount);
	}

	function onMouseEnter() {
		setIsHovered(true);
		scaleValue.set(scale);
	}

	function onMouseLeave() {
		setIsHovered(false);
		rotateX.set(0);
		rotateY.set(0);
		scaleValue.set(1);
	}

	return (
		<motion.div
			ref={ref}
			className={cn("relative touch-none", className)}
			style={{
				perspective,
				transformStyle: "preserve-3d",
			}}
			onMouseMove={onMouseMove}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			<motion.div
				style={{
					rotateX,
					rotateY,
					scale: scaleValue,
				}}
			>
				{children}
			</motion.div>

			{isHovered && (
				<motion.div
					className="absolute inset-0 pointer-events-none"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					style={{
						background:
							"radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(var(--primary-rgb), 0.1) 0%, transparent 60%)",
					}}
				/>
			)}
		</motion.div>
	);
}
