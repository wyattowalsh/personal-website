import { Metadata, Viewport } from "next";
import { Fira_Code, Montserrat } from "next/font/google";
import "./globals.scss";
import "katex/dist/katex.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScrollIndicator from "@/components/ScrollIndicator";
import Header from "@/components/Header";
import KaTeXLoader from "@/components/KaTeXLoader";
import { StrictMode } from 'react';
import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google';
import { cn } from "@/lib/utils";
import { getDefaultMetadata } from '@/lib/core';
import { generateWebSiteSchema } from '@/lib/schema';
import { TooltipProvider } from "@/components/ui/tooltip";

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

// Base metadata configuration
export const metadata: Metadata = {
  ...getDefaultMetadata(),
  other: {
    ...getDefaultMetadata().other },
  // JSON-LD schema
  alternates: {
    types: {
      'application/ld+json': `${generateWebSiteSchema()}`,
    },
  },
};

// Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ],
  width: 'device-width',
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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 flex flex-col">
                  {children}
                </main>
              </div>
            </TooltipProvider>
          </ThemeProvider>
          <ScrollIndicator />
          <KaTeXLoader />
          <GoogleTagManager gtmId="GTM-P7VFKNK6" />
          <GoogleAnalytics gaId="G-17PRGFZN0C" />
        </body>
      </html>
    </StrictMode>
  );
}
