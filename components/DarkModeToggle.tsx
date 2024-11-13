"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";

export default function DarkModeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	const toggleTheme = () => {
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	};

	const icon = resolvedTheme === "dark" ? faSun : faMoon;

	return (
		<div className="fixed top-4 right-4 z-50">
			<Button onClick={toggleTheme} className="p-2 rounded bg-gray-200 dark:bg-gray-800">
				<FontAwesomeIcon icon={icon} />
			</Button>
		</div>
	);
}
