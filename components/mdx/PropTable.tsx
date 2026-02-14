"use client";

import { cn } from "@/lib/utils";
import { Check, X, Minus, Info } from "lucide-react";

interface Prop {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description?: string;
  deprecated?: boolean;
}

interface PropTableProps {
  props: Prop[];
  title?: string;
  className?: string;
}

export default function PropTable({ props, title, className }: PropTableProps) {
  return (
    <div className={cn("my-6", className)}>
      {title && (
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          {title}
        </h4>
      )}

      <div
        className={cn(
          "overflow-x-auto rounded-xl",
          "border border-border/50"
        )}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border/50">
              <th className="px-4 py-3 text-left font-medium">Prop</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Default</th>
              <th className="px-4 py-3 text-center font-medium">Required</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {props.map((prop, index) => (
              <tr
                key={index}
                className={cn(
                  "border-b border-border/30 last:border-b-0",
                  "hover:bg-muted/30 transition-colors",
                  prop.deprecated && "opacity-60"
                )}
              >
                {/* Name */}
                <td className="px-4 py-3">
                  <code
                    className={cn(
                      "text-primary font-mono text-sm",
                      prop.deprecated && "line-through"
                    )}
                  >
                    {prop.name}
                  </code>
                  {prop.deprecated && (
                    <span className="ml-2 text-xs text-amber-500">deprecated</span>
                  )}
                </td>

                {/* Type */}
                <td className="px-4 py-3">
                  <code className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                    {prop.type}
                  </code>
                </td>

                {/* Default */}
                <td className="px-4 py-3">
                  {prop.default !== undefined ? (
                    <code className="text-xs font-mono text-muted-foreground">
                      {prop.default}
                    </code>
                  ) : (
                    <Minus className="w-4 h-4 text-muted-foreground/50" />
                  )}
                </td>

                {/* Required */}
                <td className="px-4 py-3 text-center">
                  {prop.required ? (
                    <Check className="w-4 h-4 text-green-500 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/50 mx-auto" />
                  )}
                </td>

                {/* Description */}
                <td className="px-4 py-3 text-muted-foreground">
                  {prop.description || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
