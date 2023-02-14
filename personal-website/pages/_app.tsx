import "@fontsource/roboto";
import "@fontsource/ubuntu";
import "@fontsource/ubuntu-mono";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { AppProps } from "next/app";
import "../styles/globals.css";
config.autoAddCss = false;


export default function App({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />;
}
