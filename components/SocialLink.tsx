// components/SocialLink.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

interface SocialLinkProps {
	link: {
		name: string;
		url: string;
		icon: IconProp;
		color: string;
	};
}

export default function SocialLink({ link }: SocialLinkProps) {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	const rotateX = useTransform(mouseY, [0, 300], [15, -15]);
	const rotateY = useTransform(mouseX, [0, 300], [-15, 15]);

	const handleMouseMove = (
		e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
	) => {
		const rect = e.currentTarget.getBoundingClientRect();
		mouseX.set(e.clientX - rect.left);
		mouseY.set(e.clientY - rect.top);
	};

	return (
		<motion.a
			href={link.url}
			rel="noopener noreferrer"
			className="group"
			onMouseMove={handleMouseMove}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover="hover"
		>
			<motion.div
				className="card-container"
				style={{
					rotateX,
					rotateY,
					colorScheme: "light"
				}}
				variants={{
					hover: {
						scale: 1.05,
						transition: { duration: 0.3 },
					},
				}}
			>
				<Card className="card">
					<CardContent className="card-content">
						<div className="flex flex-col items-center space-y-2">
							<FontAwesomeIcon
								icon={link.icon}
								className="icon"
								style={{ color: link.color }}
							/>
							<span className="link-name">{link.name}</span>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</motion.a>
	);
}
