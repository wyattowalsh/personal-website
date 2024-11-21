const withMDX = require("@next/mdx")({
	extension: /\.mdx?$/,
	options: {
		remarkPlugins: [
			// Remove remark-validate-links or configure it properly
			// [require('remark-validate-links'), { repository: 'https://github.com/wyattowalsh/personal-website' }]
		],
		rehypePlugins: [],
	},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
	images: {
		domains: ["github.githubassets.com"],
	},
};

module.exports = withMDX(nextConfig);
