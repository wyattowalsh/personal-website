import { IConfig } from "next-sitemap";

const config = {
	siteUrl: "https://w4w.dev",
	changefreq: "daily",
	priority: 0.7,
	sitemapSize: 50000,
	generateRobotsTxt: true,
	exclude: [
		"/favicon.icon",
		"/apple-icon.png",
		"/manifest.webmanifest",
		"/tags/*",
		"/logo.png",
		"/logo.webp",
		"opengraph.png",
		"twitter-image.png",
	],
	generateIndexSitemap: true,
	robotsTxtOptions: {
		policies: [
			{
				userAgent: "*",
				allow: "/",
			},
		],
	},
};

export default config;
