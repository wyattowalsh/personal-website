import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";

const fira_code = Fira_Code({
	subsets: ["latin"],
	variable: "--font-fira-code",
});

export const metadata: Metadata = {
	title: "Wyatt Walsh's Personal Website",
	description:
		"Wyatt Walsh's personal website with bio, linktree, and knowledge base",
	icons: {
		icon: "/logo.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${fira_code.className} min-h-screen flex flex-col`}>
				{children}
			</body>
		</html>
	);
}
