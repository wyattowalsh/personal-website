// components/DarkModeToggle.tsx

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function DarkModeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	const isDark = resolvedTheme === "dark";

	return (
		<div className="fixed top-4 right-4 z-50">
			<Button
				onClick={() => setTheme(isDark ? "light" : "dark")}
				className="p-2 rounded-full"
				variant="outline"
			>
				<motion.div
					initial={{ rotate: 0 }}
					animate={{ rotate: isDark ? 180 : 0 }}
					transition={{ duration: 0.5 }}
				>
					{isDark ? "🌞" : "🌜"}
				</motion.div>
			</Button>
		</div>
	);
}
