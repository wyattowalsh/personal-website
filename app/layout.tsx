import { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import localFont from "next/font/local";
import "./tailwind.css";  // Tailwind v4 with config directive
import "./globals.css";  // Custom styles (no Tailwind directives)
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { StrictMode } from "react";
import { cn } from "@/lib/utils";
import { getDefaultMetadata } from "@/lib/config";
import { WebSiteJsonLd } from "@/components/PostSchema";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteAnalytics } from "@/components/SiteAnalytics";

const monaspace = localFont({
	src: "../public/fonts/MonaspaceArgon-subset.woff2",
	variable: "--font-monaspace",
	display: "swap",
	weight: "200 800",
});

const bricolage = Bricolage_Grotesque({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-bricolage",
	preload: true,
	fallback: ["system-ui", "arial"],
});

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
const gaId = process.env.NEXT_PUBLIC_GA_ID;
const analyticsEnabled = process.env.NODE_ENV === "production";
const defaultMetadata = getDefaultMetadata();

// Base metadata configuration
export const metadata: Metadata = {
	...defaultMetadata,
	manifest: '/manifest.json',
	icons: {
		icon: [
			{ url: '/favicon.ico', sizes: '32x32' },
			{ url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
			{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
		],
		apple: [
			{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
		],
		other: [
			{ rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
			{ rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
		],
	},
	// Feed autodiscovery links
	alternates: {
		...defaultMetadata.alternates,
		canonical: "/",
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
					{/* Preconnect to Google services when analytics are enabled */}
					{(gtmId || gaId) && (
						<>
							<link rel="preconnect" href="https://www.googletagmanager.com" />
							<link rel="preconnect" href="https://www.google-analytics.com" />
						</>
					)}
				</head>
				<body
					className={cn(
						"min-h-screen bg-background font-sans",
						"motion-safe:transition-colors motion-safe:duration-300",
						"selection:bg-primary/20 selection:text-primary",
						"scrollbar-thin scrollbar-track-transparent",
						"scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20",
						bricolage.variable,
						monaspace.variable
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
								<main id="main-content" className="flex-1 flex flex-col pt-14 sm:pt-16">{children}</main>
							</div>
						</TooltipProvider>
					</ThemeProvider>
						<SiteAnalytics gaId={gaId} gtmId={gtmId} enabled={analyticsEnabled} />
					</body>
			</html>
		</StrictMode>
	);
}
