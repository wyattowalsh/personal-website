import { Metadata } from "next";
import { Fira_Code, Montserrat } from "next/font/google";
import "./globals.scss";
import "katex/dist/katex.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScrollIndicator from "@/components/ScrollIndicator";
import Header from "@/components/Header";
import KaTeXLoader from "@/components/KaTeXLoader";
import CustomScrollbars from "@/components/Scroll";
import { StrictMode } from 'react';
import { GoogleTagManager } from '@next/third-parties/google'
import { cn } from "@/lib/utils";

config.autoAddCss = false;

const firaCode = Fira_Code({
	subsets: ["latin"],
	variable: "--font-fira-code",
});

const montserrat = Montserrat({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-montserrat",
	preload: true,
	fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
	title: "w4w.dev | Wyatt Walsh",
	description: "Wyatt's personal web app with social links, blog, and more.",
	icons: {
		icon: "/logo.webp",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<StrictMode>
		<html lang="en" suppressHydrationWarning className="antialiased">
			<GoogleTagManager gtmId="GTM-P7VFKNK6" />
			<body
				className={cn(
					"min-h-screen bg-background font-sans",
					"motion-safe:transition-colors motion-safe:duration-300",
					"selection:bg-primary/20 selection:text-primary",
					"scrollbar-thin scrollbar-track-transparent",
					"scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20",
					montserrat.variable,
					firaCode.variable
				)}
				suppressHydrationWarning>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
								<div className="relative flex min-h-screen flex-col">
									<Header />
									<main className="flex-1">
										<CustomScrollbars>{children}</CustomScrollbars>
									</main>
								</div>
						</ThemeProvider>
				<ScrollIndicator />
				<KaTeXLoader />
			</body>
		</html>
		</StrictMode>
	);
}
