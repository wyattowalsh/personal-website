import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

interface PostCardProps {
	post: {
		slug: string;
		title?: string;
		summary?: string;
		date?: string;
		tags?: string[];
		image?: string;
	};
}

const PostCard = ({ post }: PostCardProps) => {
	const {
		slug,
		title = "Untitled Post",
		summary = "No summary available.",
		date,
		tags = [],
		image = "/default-image.jpg",
	} = post;

	return (
		<motion.div whileHover={{ scale: 1.02 }}>
			<Link href={`/blog/${slug}`}>
				<Card className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
					<div className="relative h-48">
						<Image
							src={image}
							alt={title}
							layout="fill"
							objectFit="cover"
							priority
						/>
					</div> 
					<div className="p-4">
						<h3 className="text-xl font-semibold mb-2">{title}</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-4">{summary}</p>
						{date && (
							<p className="text-sm text-gray-500">
								{formatDate(date, "en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>
						)}
						{tags.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-4">
								{tags.map((tag, index) => (
									<Badge key={index} variant="secondary">
										{tag}
									</Badge>
								))}
							</div>
						)}
					</div>
				</Card>
			</Link>
		</motion.div>
	);
};

export default PostCard;
