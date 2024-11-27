import React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { getAllTags } from "@/lib/services/backend";
import { Badge } from "@/components/ui/badge";
import ParticlesBackground from "@/components/ParticlesBackground";

export default async function TagsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tags = await getAllTags();

  return (
    <section className="container mx-auto px-4">
      <ParticlesBackground />
      <div className="py-4">
        <nav className="flex flex-wrap gap-2 mb-4 items-center justify-center">
          {tags.map((tag) => (
            <Link key={tag} href={`/blog/tags/${tag}`}>
              <Badge
                variant="secondary"
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground cursor-pointer"
              >
                #{tag}
              </Badge>
            </Link>
          ))}
        </nav>
        <Separator className="my-4" />
      </div>
      {children}
    </section>
  );
}
