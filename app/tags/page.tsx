import Link from "next/link";
import { getAllTags } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";

export default function TagsPage() {
	const tags = getAllTags();
	return (
		<div className="prose mx-auto">
			<h1 className="text-5xl font-bold text-center mb-8">All Tags</h1>
			<div className="flex flex-wrap gap-2">
				{tags.map((tag) => (
					<Link key={tag} href={`/tags/${tag}`}>
						<Badge
							variant="outline"
							className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
						>
							{tag}
						</Badge>
					</Link>
				))}
			</div>
		</div>
	);
}
