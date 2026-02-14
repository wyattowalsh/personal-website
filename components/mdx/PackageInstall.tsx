"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";

interface PackageInstallProps {
  package: string;
  dev?: boolean;
  global?: boolean;
  className?: string;
}

type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

const MANAGERS: { id: PackageManager; label: string; icon: string }[] = [
  { id: "npm", label: "npm", icon: "📦" },
  { id: "yarn", label: "yarn", icon: "🧶" },
  { id: "pnpm", label: "pnpm", icon: "🚀" },
  { id: "bun", label: "bun", icon: "🥟" },
];

function getCommand(
  manager: PackageManager,
  pkg: string,
  dev: boolean,
  global: boolean
): string {
  const packages = pkg.trim();

  switch (manager) {
    case "npm":
      if (global) return `npm install -g ${packages}`;
      return `npm install ${dev ? "-D " : ""}${packages}`;

    case "yarn":
      if (global) return `yarn global add ${packages}`;
      return `yarn add ${dev ? "-D " : ""}${packages}`;

    case "pnpm":
      if (global) return `pnpm add -g ${packages}`;
      return `pnpm add ${dev ? "-D " : ""}${packages}`;

    case "bun":
      if (global) return `bun add -g ${packages}`;
      return `bun add ${dev ? "-d " : ""}${packages}`;

    default:
      return "";
  }
}

export default function PackageInstall({
  package: pkg,
  dev = false,
  global: isGlobal = false,
  className,
}: PackageInstallProps) {
  const [activeManager, setActiveManager] = useState<PackageManager>("npm");
  const [copied, setCopied] = useState(false);

  const command = getCommand(activeManager, pkg, dev, isGlobal);

  const copyCommand = useCallback(async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [command]);

  return (
    <div
      className={cn(
        "my-6 rounded-xl overflow-hidden",
        "border border-border/50",
        className
      )}
    >
      {/* Tab bar */}
      <div
        className={cn(
          "flex items-center gap-1",
          "px-2 py-1.5",
          "bg-muted/50 border-b border-border/50",
          "overflow-x-auto"
        )}
      >
        {MANAGERS.map((manager) => (
          <button
            key={manager.id}
            onClick={() => setActiveManager(manager.id)}
            className={cn(
              "flex items-center gap-1.5",
              "px-3 py-1.5 rounded-md",
              "text-sm font-medium",
              "transition-all duration-200",
              activeManager === manager.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <span className="text-base">{manager.icon}</span>
            <span>{manager.label}</span>
          </button>
        ))}

        {/* Badge */}
        {(dev || isGlobal) && (
          <div className="ml-auto flex items-center gap-1">
            {dev && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-500">
                dev
              </span>
            )}
            {isGlobal && (
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-500">
                global
              </span>
            )}
          </div>
        )}
      </div>

      {/* Command */}
      <div className="relative group">
        <pre
          className={cn(
            "p-4 overflow-x-auto",
            "bg-slate-900 text-slate-300",
            "font-mono text-sm"
          )}
        >
          <code>{command}</code>
        </pre>

        {/* Copy button */}
        <button
          onClick={copyCommand}
          className={cn(
            "absolute top-2 right-2",
            "p-2 rounded-md",
            "bg-slate-800 hover:bg-slate-700",
            "text-slate-400 hover:text-slate-200",
            "transition-all duration-200",
            "opacity-0 group-hover:opacity-100 focus:opacity-100"
          )}
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
