"use client";

import React from "react";
import dynamic from "next/dynamic";
const ParticlesBackground = dynamic(() => import("@/components/ParticlesBackground"), { ssr: false });

export default function TagsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen relative">
      <div className="absolute inset-0">
        <ParticlesBackground className="opacity-10" />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}
