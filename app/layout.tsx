import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.scss";
import { GoogleTagManager } from "@next/third-parties/google";
import { ThemeProvider } from "next-themes";
import DarkModeToggle from "@/components/DarkModeToggle";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const fira_code = Fira_Code({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-fira-code",
});

export const metadata: Metadata = {
	title: "Wyatt Walsh's Social Links, Blog, and Other Web Stuff",
	description:
		"Wyatt's social links, blog, and other web stuff.",
	icons: {
		icon: "/logo.webp",
	},
};

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="light fontawesome-i2svg-active fontawesome-i2svg-complete" style={{ colorScheme: "light" }}>
			<GoogleTagManager gtmId="GTM-P7VFKNK6" />
			<body className="__className_74c79e max-h-screen" cz-shortcut-listen="true" data-extension-installed="2.4.2" data-new-gr-c-s-check-loaded="14.1207.0" data-gr-ext-installed="">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<DarkModeToggle />
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
