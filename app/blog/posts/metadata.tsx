import { Metadata, ResolvingMetadata } from "next";

export const metadata: Metadata = {
	description:
		"Read the latest blog posts about software development and technology",
	openGraph: {
		type: "website",
		title: "Blog",
		description:
			"Read the latest blog posts about software development and technology",
	},
};

export async function generateMetadata(
	{ params, searchParams }: any,
	parent: ResolvingMetadata
): Promise<Metadata> {
	const previousMetadata = await parent;
	const parentTitle = previousMetadata?.title?.absolute || previousMetadata?.title;

	return {
		title: {
			absolute: `${parentTitle} | onelonedatum by Wyatt Walsh`,
		},
		description: metadata.description,
		openGraph: metadata.openGraph,
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
			}
		}
	};
}
