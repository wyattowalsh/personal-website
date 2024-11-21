import { Metadata } from "next";
import { Fira_Code, Montserrat } from "next/font/google";
import "./globals.scss";
import "katex/dist/katex.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { ThemeProvider } from "@/components/ThemeProvider";
import LayoutContent from "@/components/LayoutContent";
import ScrollIndicator from "@/components/ScrollIndicator";
import Header from "@/components/Header";

config.autoAddCss = false;

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Welcome to Wyatt's Personal Web App",
  description: "Wyatt's personal web app with social links, blog, and more.",
  icons: {
    icon: "/logo.webp",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-background font-sans antialiased ${montserrat.variable} ${firaCode.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
        </ThemeProvider>
      </body>
      <ScrollIndicator />
    </html>
  );
}
