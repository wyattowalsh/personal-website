import { BackendService } from "@/lib/server";
import PostCard from "@/components/PostCard";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface TagPageProps {
    params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
    await BackendService.ensurePreprocessed();
    const tags = await BackendService.getInstance().getAllTags();
    return tags.map((tag) => ({
        tag: encodeURIComponent(tag),
    }));
}

export async function generateMetadata({
    params,
}: { params: Promise<{ tag: string }> }): Promise<Metadata> {
    const { tag } = await params;
    const decodedTag = decodeURIComponent(tag);
    return {
        title: `Posts tagged with #${decodedTag}`,
        description: `Browse all blog posts tagged with #${decodedTag}`,
    };
}

type Props = {
    params: Promise<{
        tag: string;
    }>;
};

export default async function TagPage({ params }: Props) {
    const { tag } = await params;
    const decodedTag = decodeURIComponent(tag);
    
    await BackendService.ensurePreprocessed();
    const backend = BackendService.getInstance();
    const [posts, tags] = await Promise.all([
        backend.getAllPosts(),
        backend.getAllTags()
    ]);

    if (!tags.includes(decodedTag)) {
        notFound();
    }

    const filteredPosts = posts.filter((post) => post.tags?.includes(decodedTag));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">
                    Posts tagged with <span className="text-primary">#{decodedTag}</span>
                </h1>
                <p className="text-muted-foreground">
                    Found {filteredPosts.length} post
                    {filteredPosts.length === 1 ? "" : "s"}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                ))}
            </div>
        </div>
    );
}
