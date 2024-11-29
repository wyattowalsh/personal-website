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
	const previousMetadata = (await parent) || {};

	return {
		...previousMetadata,
		...metadata,
		title: {
			absolute: `${
				previousMetadata.title?.absolute || previousMetadata.title
			} | onelonedatum by Wyatt Walsh`,
		},
	};
}
