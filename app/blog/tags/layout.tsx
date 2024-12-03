"use client";

import React from "react";
import ParticlesBackground from "@/components/ParticlesBackground";

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
