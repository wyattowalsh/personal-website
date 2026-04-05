import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentType, CSSProperties, JSX } from "react";
import type { Route } from 'next';

interface SocialLinkProps {
  link: {
    name: string;
    url: string;
    icon: ComponentType<{ className?: string }>;
    color?: string;
  };
}

// Improved luminance calculation with gamma correction
function getLuminance(hexColor: string): number {
  const rgb = hexColor.replace('#', '').match(/.{2}/g);
  if (!rgb) return 0;
  
  // Convert to sRGB
  const [r, g, b] = rgb.map(x => {
    const channel = parseInt(x, 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  
  // Use perceived luminance weights
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRGB(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function lightenColor(hex: string, amount: number): string {
  const rgb = hex.replace('#', '').match(/.{2}/g);
  if (!rgb) return hex;
  
  const [r, g, b] = rgb.map(x => parseInt(x, 16));
  const lightenChannel = (c: number) => {
    const increment = Math.floor((255 - c) * amount);
    // Add smoothing to prevent harsh transitions
    return Math.min(255, c + increment);
  };
  
  const rr = lightenChannel(r).toString(16).padStart(2, '0');
  const gg = lightenChannel(g).toString(16).padStart(2, '0');
  const bb = lightenChannel(b).toString(16).padStart(2, '0');
  
  return `#${rr}${gg}${bb}`;
}

function darkenColor(hex: string, amount: number): string {
  const rgb = hex.replace('#', '').match(/.{2}/g);
  if (!rgb) return hex;
  
  const [r, g, b] = rgb.map(x => parseInt(x, 16));
  const darkenChannel = (c: number) => {
    const decrement = Math.floor(c * amount);
    // Add smoothing to prevent harsh transitions
    return Math.max(0, c - decrement);
  };
  
  const rr = darkenChannel(r).toString(16).padStart(2, '0');
  const gg = darkenChannel(g).toString(16).padStart(2, '0');
  const bb = darkenChannel(b).toString(16).padStart(2, '0');
  
  return `#${rr}${gg}${bb}`;
}

// Update adjustColorForMode function for better dark mode handling
function adjustColorForMode(color: string, isDark: boolean) {
  const DEFAULT_COLOR = "#6a9fb5";
  const baseColor = color || DEFAULT_COLOR;
  const luminance = getLuminance(baseColor);

  const darkModeAdjustment = {
    iconColor: luminance < 0.5
      ? lightenColor(baseColor, 0.4)  // Slightly less lightening
      : luminance < 0.7
        ? lightenColor(baseColor, 0.3) // Slightly less lightening
        : baseColor,
    bgStyle: `rgba(${hexToRGB(baseColor)}, 0.15)`,
    bgHoverStyle: `rgba(${hexToRGB(baseColor)}, 0.25)`,
    textColor: "#f8fafc", // slate-50
    iconBgColor: "rgba(255, 255, 255, 0.05)", // More transparent in dark mode
  };

  const lightModeAdjustment = {
    iconColor: luminance > 0.7
      ? darkenColor(baseColor, 0.4)   // Slightly less darkening
      : luminance > 0.5
        ? darkenColor(baseColor, 0.2) // Slightly less darkening
        : baseColor,
    bgStyle: `rgba(${hexToRGB(baseColor)}, 0.1)`,
    bgHoverStyle: `rgba(${hexToRGB(baseColor)}, 0.15)`,
    textColor: "#0f172a", // slate-900
    iconBgColor: "rgba(255, 255, 255, 0.95)",
  };

  return isDark ? darkModeAdjustment : lightModeAdjustment;
}

export function SocialLink({ link }: SocialLinkProps): JSX.Element {
  const isInternalLink = link.url.startsWith("/");
  const baseColor = link.color || "#6a9fb5";
  const colors = {
    light: adjustColorForMode(baseColor, false),
    dark: adjustColorForMode(baseColor, true),
  };

  // Update the icon container class names and styles
  const iconContainerClassName = cn(
    "relative flex items-center justify-center",
    "w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24",
    "rounded-xl",
    // Enhanced contrast background
    "bg-white/95 dark:bg-white/5", // Adjusted opacity for dark mode
    // Border and shadow for depth
    "border border-black/5 dark:border-white/10",
    "shadow-md dark:shadow-black/25",
    // Animations
    "motion-safe:transform-gpu motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out",
    "motion-safe:group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none",
    // Additional contrast
    "after:absolute after:inset-0 after:rounded-xl",
    "after:bg-gradient-to-br",
    "after:from-white/50 after:to-transparent dark:after:from-white/10 dark:after:to-transparent",
    "after:opacity-0 group-hover:after:opacity-100",
  );

  // Update the label class names
  const labelClassName = cn(
    "mt-4 text-sm md:text-base lg:text-lg",
    "font-medium text-center",
    "motion-safe:transition-colors motion-safe:duration-300",
    "motion-reduce:transition-none",
    // Ensure text contrast and remove underline
    "no-underline",
    "text-slate-900 dark:text-slate-100",
    "drop-shadow-sm dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
  );

  const linkContent = (
    <div
      className={cn(
        // Base layout
        "group relative flex flex-col items-center justify-center",
        "w-full h-full p-4 md:p-6 lg:p-8",
        "rounded-2xl overflow-hidden",
        "[--link-hover-color:var(--link-hover-color-light)] dark:[--link-hover-color:var(--link-hover-color-dark)]",
        "[--link-icon-color:var(--link-icon-color-light)] dark:[--link-icon-color:var(--link-icon-color-dark)]",
        "[--link-icon-bg:var(--link-icon-bg-light)] dark:[--link-icon-bg:var(--link-icon-bg-dark)]",
        // Enhanced glass morphism
        "bg-white/5 dark:bg-black/20",
        "border border-black/5 dark:border-white/10",
        // Hover and animation
        "motion-safe:transform-gpu motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:ease-out",
        "motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.02]",
        "motion-reduce:transform-none motion-reduce:transition-none",
        // Shadows
        "shadow-lg hover:shadow-xl",
        "shadow-black/5 dark:shadow-white/5"
      )}
      style={{
        '--link-hover-color-light': colors.light.bgHoverStyle,
        '--link-hover-color-dark': colors.dark.bgHoverStyle,
        '--link-icon-color-light': colors.light.iconColor,
        '--link-icon-color-dark': colors.dark.iconColor,
        '--link-icon-bg-light': colors.light.iconBgColor,
        '--link-icon-bg-dark': colors.dark.iconBgColor,
      } as CSSProperties}
    >
      {/* Icon Container with guaranteed contrast */}
      <div
        className={iconContainerClassName}
        style={{
          backgroundColor: 'var(--link-icon-bg)',
        }}
      >
        <div
          className={cn(
            "relative z-10",
          )}
          style={{ color: 'var(--link-icon-color)' }}
        >
          <link.icon
            className={cn(
              "w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12",
              // Enhanced visibility
              "drop-shadow-md dark:drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]",
              "group-hover:drop-shadow-lg"
            )}
          />
        </div>
      </div>

      {/* Label */}
      <span
        className={labelClassName}
      >
        {link.name}
      </span>

      {/* Enhanced hover effect */}
      <div
        className={cn(
          "absolute inset-0 -z-10",
          "opacity-0 group-hover:opacity-100",
          "motion-safe:transition-opacity motion-safe:duration-300",
          "motion-reduce:transition-none",
          "pointer-events-none"
        )}
        style={{
          background: `radial-gradient(
            420px circle at 50% 50%,
            var(--link-hover-color),
            transparent 40%
          )`,
        }}
      />
    </div>
  );

  if (isInternalLink) {
    return (
      <Link
        href={link.url as Route}
        className={cn(
          "block w-full h-full rounded-2xl no-underline",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      >
        {linkContent}
      </Link>
    );
  }

  const isEmailLink = link.url.startsWith('mailto:');
  const isSocialProfile = !isEmailLink && !isInternalLink;

  return (
    <a
      href={link.url}
      target={isEmailLink ? undefined : "_blank"}
      rel={isSocialProfile ? "me noopener noreferrer" : isEmailLink ? undefined : "noopener noreferrer"}
      aria-label={isEmailLink ? link.name : `${link.name} (opens in new tab)`}
      className={cn(
        "block w-full h-full rounded-2xl no-underline",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      {linkContent}
    </a>
  );
}
