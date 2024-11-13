import Link from "next/link";
import { headers } from "next/headers";
import { getSortedPostsData } from "@/lib/posts";

export default async function NotFound() {
	const headersList = await headers();
	const domain = headersList.get("host");
	const posts = getSortedPostsData();
	return (
		<div>
			<h2>Not Found</h2>
			<p>Could not find requested resource</p>
			<p>
				View <Link href="/blog">all posts</Link>
			</p>
			<p>
				Go back to <Link href="/">home page</Link>
			</p>
		</div>
	);
}
