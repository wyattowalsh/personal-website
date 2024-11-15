"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
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
	return (
		<a
			href={link.url}
			className="group relative block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform transform hover:scale-105"
		>
			<div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
			<div className="relative flex flex-col items-center justify-center space-x-2">
				<FontAwesomeIcon icon={link.icon} style={{ color: link.color, fontSize: '3rem', marginBottom: '0.5rem' }} />
				<span className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-white group-hover:underline transition-colors duration-500">
					{link.name}
				</span>
			</div>
		</a>
	);
}
