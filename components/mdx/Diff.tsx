"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
  lineNumber?: { old?: number; new?: number };
}

interface DiffProps {
  oldCode: string;
  newCode: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
}

interface DiffBlockProps {
  lines: DiffLine[];
  title?: string;
  showLineNumbers?: boolean;
  className?: string;
}

// Simple diff algorithm
function computeDiff(oldLines: string[], newLines: string[]): DiffLine[] {
  const result: DiffLine[] = [];
  
  // LCS-based diff (simplified)
  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);
  
  let oldIdx = 0;
  let newIdx = 0;
  let oldLineNum = 1;
  let newLineNum = 1;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    const oldLine = oldLines[oldIdx];
    const newLine = newLines[newIdx];

    if (oldIdx >= oldLines.length) {
      // Remaining new lines are additions
      result.push({
        type: "add",
        content: newLine,
        lineNumber: { new: newLineNum++ },
      });
      newIdx++;
    } else if (newIdx >= newLines.length) {
      // Remaining old lines are removals
      result.push({
        type: "remove",
        content: oldLine,
        lineNumber: { old: oldLineNum++ },
      });
      oldIdx++;
    } else if (oldLine === newLine) {
      // Context line
      result.push({
        type: "context",
        content: oldLine,
        lineNumber: { old: oldLineNum++, new: newLineNum++ },
      });
      oldIdx++;
      newIdx++;
    } else if (!newSet.has(oldLine)) {
      // Old line was removed
      result.push({
        type: "remove",
        content: oldLine,
        lineNumber: { old: oldLineNum++ },
      });
      oldIdx++;
    } else if (!oldSet.has(newLine)) {
      // New line was added
      result.push({
        type: "add",
        content: newLine,
        lineNumber: { new: newLineNum++ },
      });
      newIdx++;
    } else {
      // Both lines exist but in different positions - treat as remove then add
      result.push({
        type: "remove",
        content: oldLine,
        lineNumber: { old: oldLineNum++ },
      });
      oldIdx++;
    }
  }

  return result;
}

// Diff from two code strings
export default function Diff({
  oldCode,
  newCode,
  language,
  filename,
  showLineNumbers = true,
  className,
}: DiffProps) {
  const lines = useMemo(() => {
    const oldLines = oldCode.split("\n");
    const newLines = newCode.split("\n");
    return computeDiff(oldLines, newLines);
  }, [oldCode, newCode]);

  const stats = useMemo(() => {
    const additions = lines.filter((l) => l.type === "add").length;
    const deletions = lines.filter((l) => l.type === "remove").length;
    return { additions, deletions };
  }, [lines]);

  return (
    <div
      className={cn(
        "my-6 rounded-xl overflow-hidden",
        "border border-border/50",
        "font-mono text-sm",
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between",
          "px-4 py-2",
          "bg-muted/50 border-b border-border/50"
        )}
      >
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-muted-foreground">{filename}</span>
          )}
          {language && (
            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {language}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-green-500">
            <Plus className="w-3 h-3" />
            {stats.additions}
          </span>
          <span className="flex items-center gap-1 text-red-500">
            <Minus className="w-3 h-3" />
            {stats.deletions}
          </span>
        </div>
      </div>

      {/* Diff content */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, index) => (
              <tr
                key={index}
                className={cn(
                  line.type === "add" && "bg-green-500/10",
                  line.type === "remove" && "bg-red-500/10"
                )}
              >
                {/* Line numbers */}
                {showLineNumbers && (
                  <>
                    <td
                      className={cn(
                        "w-12 px-2 py-0.5 text-right select-none",
                        "text-muted-foreground/50 text-xs",
                        "border-r border-border/30"
                      )}
                    >
                      {line.lineNumber?.old || ""}
                    </td>
                    <td
                      className={cn(
                        "w-12 px-2 py-0.5 text-right select-none",
                        "text-muted-foreground/50 text-xs",
                        "border-r border-border/30"
                      )}
                    >
                      {line.lineNumber?.new || ""}
                    </td>
                  </>
                )}

                {/* Indicator */}
                <td
                  className={cn(
                    "w-6 px-1 py-0.5 text-center select-none",
                    line.type === "add" && "text-green-500",
                    line.type === "remove" && "text-red-500"
                  )}
                >
                  {line.type === "add" && "+"}
                  {line.type === "remove" && "-"}
                </td>

                {/* Content */}
                <td className="px-2 py-0.5 whitespace-pre">
                  <span
                    className={cn(
                      line.type === "add" && "text-green-400",
                      line.type === "remove" && "text-red-400",
                      line.type === "context" && "text-muted-foreground"
                    )}
                  >
                    {line.content || " "}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Pre-computed diff block (for manual diff specification)
export function DiffBlock({
  lines,
  title,
  showLineNumbers = true,
  className,
}: DiffBlockProps) {
  const stats = useMemo(() => {
    const additions = lines.filter((l) => l.type === "add").length;
    const deletions = lines.filter((l) => l.type === "remove").length;
    return { additions, deletions };
  }, [lines]);

  return (
    <div
      className={cn(
        "my-6 rounded-xl overflow-hidden",
        "border border-border/50",
        "font-mono text-sm",
        className
      )}
    >
      {/* Header */}
      {(title || stats.additions > 0 || stats.deletions > 0) && (
        <div
          className={cn(
            "flex items-center justify-between",
            "px-4 py-2",
            "bg-muted/50 border-b border-border/50"
          )}
        >
          {title && <span className="text-muted-foreground">{title}</span>}

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-green-500">
              <Plus className="w-3 h-3" />
              {stats.additions}
            </span>
            <span className="flex items-center gap-1 text-red-500">
              <Minus className="w-3 h-3" />
              {stats.deletions}
            </span>
          </div>
        </div>
      )}

      {/* Diff content */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, index) => (
              <tr
                key={index}
                className={cn(
                  line.type === "add" && "bg-green-500/10",
                  line.type === "remove" && "bg-red-500/10"
                )}
              >
                {/* Indicator */}
                <td
                  className={cn(
                    "w-6 px-2 py-0.5 text-center select-none font-bold",
                    line.type === "add" && "text-green-500",
                    line.type === "remove" && "text-red-500"
                  )}
                >
                  {line.type === "add" && "+"}
                  {line.type === "remove" && "-"}
                </td>

                {/* Content */}
                <td className="px-2 py-0.5 whitespace-pre">
                  <span
                    className={cn(
                      line.type === "add" && "text-green-400",
                      line.type === "remove" && "text-red-400",
                      line.type === "context" && "text-muted-foreground"
                    )}
                  >
                    {line.content || " "}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
