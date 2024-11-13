// components/ui/button.tsx

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	variant?: "primary" | "secondary" | "outline";
}

export const Button: React.FC<ButtonProps> = ({
	children,
	variant = "primary",
	...props
}) => {
	const baseStyles =
		"px-4 py-2 rounded font-semibold focus:outline-none focus:ring-2";
	const variants = {
		primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
		secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
		outline:
			"border border-gray-600 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500",
	};

	return (
		<button
			{...props}
			className={cn(baseStyles, variants[variant], props.className)}
		>
			{children}
		</button>
	);
};
