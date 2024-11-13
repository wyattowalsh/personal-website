"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";

interface SocialLinkProps {
	link: {
		name: string;
		url: string;
		icon: IconProp;
		color: string;
	};
}

export default function SocialLink({ link }: SocialLinkProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<motion.a
					href={link.url}
					className="group"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					<Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow duration-300">
						<CardContent className="flex flex-col items-center space-y-2 p-4">
							<FontAwesomeIcon
								icon={link.icon}
								className="text-4xl"
								style={{ color: link.color }}
							/>
							<span className="text-gray-900 dark:text-gray-100 font-semibold">
								{link.name}
							</span>
						</CardContent>
					</Card>
				</motion.a>
			</TooltipTrigger>
			<TooltipContent>{link.name}</TooltipContent>
		</Tooltip>
	);
}
