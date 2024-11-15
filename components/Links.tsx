"use client";

import SocialLink from "./SocialLink";
import { links } from "../data/links";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Links() {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 pt-4">
        {links.map((link) => (
          <SocialLink key={link.name} link={link} />
        ))}
      </div>
    </TooltipProvider>
  );
}
