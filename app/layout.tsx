import { Metadata, Viewport } from "next";
import { Fira_Code, Montserrat } from "next/font/google";
import "./tailwind.css";  // Tailwind v4 with config directive
import "./globals.scss";  // Custom styles (no Tailwind directives)
import "katex/dist/katex.min.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScrollIndicator from "@/components/ScrollIndicator";
import Header from "@/components/Header";
import { StrictMode } from "react";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { cn } from "@/lib/utils";
import { getDefaultMetadata } from "@/lib/core";
import { WebSiteJsonLd } from "@/components/PostSchema";
import { TooltipProvider } from "@/components/ui/tooltip";

const firaCode = Fira_Code({
	subsets: ["latin"],
	variable: "--font-fira-code",
});

const montserrat = Montserrat({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-montserrat",
	preload: true,
	fallback: ["system-ui", "arial"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://w4w.dev';
const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
const gaId = process.env.NEXT_PUBLIC_GA_ID;

// Base metadata configuration
export const metadata: Metadata = {
	...getDefaultMetadata(),
	// Add root-level OG and Twitter defaults
	openGraph: {
		type: "website",
		siteName: "onelonedatum",
		title: "Wyatt Walsh",
		description: "Articles about software engineering, data science, and technology",
		url: siteUrl,
		images: [{ url: `${siteUrl}/opengraph.png`, width: 1200, height: 630, alt: "onelonedatum" }],
	},
	twitter: {
		card: "summary_large_image",
		site: "@wyattowalsh",
		creator: "@wyattowalsh",
		title: "Wyatt Walsh",
		description: "Articles about software engineering, data science, and technology",
		images: [`${siteUrl}/opengraph.png`],
	},
	// Feed autodiscovery links
	alternates: {
		canonical: siteUrl,
		types: {
			"application/rss+xml": `${siteUrl}/feed.xml`,
			"application/atom+xml": `${siteUrl}/feed.atom`,
			"application/feed+json": `${siteUrl}/feed.json`,
		},
	},
};

// Viewport configuration
export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<StrictMode>
			<html lang="en" suppressHydrationWarning className="antialiased">
				<head>
					{/* WebSite JSON-LD structured data */}
					<WebSiteJsonLd />
					{/* Preconnect to Google services for analytics */}
					<link rel="preconnect" href="https://www.googletagmanager.com" />
					<link rel="preconnect" href="https://www.google-analytics.com" />
				</head>
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
					suppressHydrationWarning
				>
					{/* Skip to main content link for accessibility */}
					<a
						href="#main-content"
						className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
					>
						Skip to content
					</a>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<TooltipProvider>
							<div className="relative flex min-h-screen flex-col">
								<Header />
								<main id="main-content" role="main" aria-label="Main content" className="flex-1 flex flex-col">{children}</main>
							</div>
						</TooltipProvider>
						<ScrollIndicator />
					</ThemeProvider>
					{gtmId && <GoogleTagManager gtmId={gtmId} />}
					{gaId && <GoogleAnalytics gaId={gaId} />}
					<Analytics />
					<SpeedInsights />
				</body>
			</html>
		</StrictMode>
	);
}
