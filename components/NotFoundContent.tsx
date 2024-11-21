"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function NotFoundContent() {
  const pathname = usePathname();
  const isBlogPage = pathname.startsWith("/blog");

  return (
    <div className="text-center space-y-6 p-8">
      <h1 className="text-6xl font-bold gradient-text">404</h1>
      <h2 className="text-2xl font-semibold gradient-heading">
        {isBlogPage ? "Blog Post Not Found" : "Page Not Found"}
      </h2>
      <p className="text-muted-foreground">
        {isBlogPage
          ? "The blog post you're looking for doesn't exist or has been moved."
          : "The page you're looking for doesn't exist or has been moved."}
      </p>
      <Button asChild variant="default">
        <Link href="/">Go back home</Link>
      </Button>
    </div>
  );
}
