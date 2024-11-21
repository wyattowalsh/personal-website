"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

interface FontSizeToggleProps {
	children?: React.ReactNode; // Make children optional
}

const FontSizeToggle: React.FC<FontSizeToggleProps> = ({ children }) => {
	const [fontSize, setFontSize] = useState(16);

	const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFontSize(Number(event.target.value));
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95"
				>
					<Settings className="h-[1.2rem] w-[1.2rem]" />
					<span className="sr-only">Adjust font size</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem asChild>
					<div className="w-full">
						<div style={{ fontSize: `${fontSize}px` }}>
							<div className="flex justify-end mb-4">
								<label
									htmlFor="font-size-slider"
									className="mr-2 text-gray-700 dark:text-gray-300"
								>
									Font Size:
								</label>
								<input
									id="font-size-slider"
									type="range"
									min="12"
									max="24"
									value={fontSize}
									onChange={handleFontSizeChange}
									className="w-32 accent-blue-600 dark:accent-blue-400"
								/>
							</div>
							<div className="prose dark:prose-dark max-w-none">{children}</div>
						</div>
					</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default FontSizeToggle;
