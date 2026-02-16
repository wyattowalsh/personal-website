"use client";

import { useEffect, useState, useRef } from "react";
import NotFoundContent from "@/components/NotFoundContent";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
const ParticlesBackground = dynamic(() => import("@/components/ParticlesBackground"), { ssr: false });

// Note: metadata export must be in a server component layout or page
// For client components like this one, metadata should be set in a parent layout

interface FloatingParticle {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
}

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [floatingParticles, setFloatingParticles] = useState<FloatingParticle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate floating particles only on client to avoid hydration mismatch
    setFloatingParticles(
      Array.from({ length: 20 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${3 + Math.random() * 2}s`,
      }))
    );

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / 25;
      const y = (e.clientY - rect.top - rect.height / 2) / 25;

      setMousePosition({ x, y });
    };

    const handleLoaded = () => {
      setIsLoaded(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("load", handleLoaded);
    // Trigger animation after a short delay
    const timer = setTimeout(() => setIsLoaded(true), 100);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("load", handleLoaded);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative min-h-[100vh] w-full",
        "flex items-center justify-center",
        "bg-background overflow-hidden",
        "transition-all duration-500 ease-out",
        isLoaded ? "opacity-100" : "opacity-0"
      )}
    >
      <ParticlesBackground />
      {/* Animated background grid with perspective effect */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{
          transform: isLoaded 
            ? `perspective(1000px) rotateX(${mousePosition.y * 0.2}deg) rotateY(${mousePosition.x * 0.2}deg)`
            : 'none',
          transition: 'transform 0.3s ease-out',
        }}
      >
        <div className={cn(
          "cyber-grid",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-b before:from-background before:to-transparent",
          "before:opacity-50"
        )} />
        <div className="glitch-scanlines" />
      </div>

      {/* Enhanced noise overlay with gradient */}
      <div className={cn(
        "noise-overlay",
        "mix-blend-overlay",
        "after:absolute after:inset-0",
        "after:bg-gradient-to-t after:from-background/80 after:to-transparent"
      )} />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingParticles.map((particle, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-1 h-1 rounded-full",
              "bg-primary/30",
              "animate-float",
            )}
            style={particle}
          />
        ))}
      </div>

      {/* Content wrapper with enhanced parallax */}
      <div 
        className={cn(
          "relative z-10",
          "transition-all duration-500",
          "transform-gpu",
          isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}
        style={{
          transform: isLoaded 
            ? `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px, 0)`
            : 'none'
        }}
      >
        {/* Glowing background effect */}
        <div className={cn(
          "absolute inset-0",
          "bg-gradient-to-r from-primary/20 to-secondary/20",
          "blur-3xl opacity-50",
          "animate-pulse",
          "-z-10"
        )} />
        
        <NotFoundContent />
      </div>
    </div>
  );
}
