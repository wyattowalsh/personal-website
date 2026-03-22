import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostLayout } from "@/components/PostLayout";
import { MathProvider } from "@/components/MathContext";
import { cn } from "@/lib/utils";
import { CustomScrollbars } from "@/components/Scroll";

type Props = {
	children: React.ReactNode;
};

export default function PostsLayout({ children }: Props) {
	return (
		<div className="relative">
			<div className={cn(
				"max-w-5xl mx-auto",
				"px-4 sm:px-6 lg:px-8",
				"pb-8",
				"relative z-10"
			)}>
				<MathProvider>
					<Suspense fallback={<LoadingSpinner />}>
					<CustomScrollbars>
						<PostLayout>
							{children}
						</PostLayout>
						</CustomScrollbars>
					</Suspense>
				</MathProvider>
			</div>
		</div>
	);
}
