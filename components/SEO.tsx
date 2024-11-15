import Head from "next/head";

interface SEOProps {
	title: string;
	description: string;
	image?: string;
	url?: string;
}

const SEO = ({ title, description, image, url }: SEOProps) => {
	return (
		<Head>
			<title>{title}</title>
			<meta name="description" content={description} />
			{/* Open Graph */}
			<meta property="og:type" content="article" />
			{url && <meta property="og:url" content={url} />}
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			{image && <meta property="og:image" content={image} />}
			{/* Twitter */}
			<meta name="twitter:card" content="summary_large_image" />
			{url && <meta property="twitter:url" content={url} />}
			<meta name="twitter:title" content={title} />
			<meta name="twitter:description" content={description} />
			{image && <meta name="twitter:image" content={image} />}
		</Head>
	);
};

export default SEO;
