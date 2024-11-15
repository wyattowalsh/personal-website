import { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.scss";
import { ThemeProvider } from "next-themes";
import DarkModeToggle from "@/components/DarkModeToggle";
import { Toast, ToastProvider } from "@/components/ui/toast";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const fira_code = Fira_Code({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-fira-code",
});

export const metadata: Metadata = {
	title:
		"Welcome to my personal web app! - Social Links, Blog, and Other Web Stuff",
	description:
		"Wyatt's personal web app with social links, blog, and other web stuff.",
	icons: {
		icon: "/logo.webp",
	},
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={fira_code.variable}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<ToastProvider>
						<main>{children}</main>
						<div className="fixed top-0 right-0 p-4">
							<DarkModeToggle />
						</div>
						<Toast />
					</ToastProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
