"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileJson,
  FileText,
  FileImage,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface FileTreeItem {
  name: string;
  type: "file" | "folder";
  children?: FileTreeItem[];
  highlight?: boolean;
  comment?: string;
}

interface FileTreeProps {
  items: FileTreeItem[];
  title?: string;
  defaultExpanded?: boolean;
  className?: string;
}

const FILE_ICONS: Record<string, typeof File> = {
  // Code files
  ts: FileCode,
  tsx: FileCode,
  js: FileCode,
  jsx: FileCode,
  py: FileCode,
  rb: FileCode,
  go: FileCode,
  rs: FileCode,
  // Data files
  json: FileJson,
  yaml: FileJson,
  yml: FileJson,
  toml: FileJson,
  // Text files
  md: FileText,
  mdx: FileText,
  txt: FileText,
  // Image files
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  svg: FileImage,
  webp: FileImage,
};

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return FILE_ICONS[ext] || File;
}

function TreeItem({
  item,
  depth = 0,
  defaultExpanded = false,
}: {
  item: FileTreeItem;
  depth?: number;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = useCallback(() => {
    if (item.type === "folder") {
      setIsExpanded(!isExpanded);
    }
  }, [item.type, isExpanded]);

  const isFolder = item.type === "folder";
  const hasChildren = isFolder && item.children && item.children.length > 0;

  const FileIcon = isFolder
    ? isExpanded
      ? FolderOpen
      : Folder
    : getFileIcon(item.name);

  return (
    <div>
      <button
        onClick={toggleExpanded}
        className={cn(
          "flex items-center gap-1.5 w-full py-1 px-2 rounded",
          "text-left text-sm",
          "hover:bg-muted/50 transition-colors",
          item.highlight && "bg-primary/10 hover:bg-primary/20",
          !isFolder && "cursor-default"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand/collapse icon */}
        {isFolder ? (
          hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )
          ) : (
            <span className="w-4 h-4 flex-shrink-0" />
          )
        ) : (
          <span className="w-4 h-4 flex-shrink-0" />
        )}

        {/* Icon */}
        <FileIcon
          className={cn(
            "w-4 h-4 flex-shrink-0",
            isFolder
              ? "text-amber-500"
              : item.highlight
              ? "text-primary"
              : "text-muted-foreground"
          )}
        />

        {/* Name */}
        <span
          className={cn(
            "truncate",
            item.highlight && "text-primary font-medium",
            isFolder && "font-medium"
          )}
        >
          {item.name}
        </span>

        {/* Comment */}
        {item.comment && (
          <span className="ml-2 text-xs text-muted-foreground italic truncate">
            {item.comment}
          </span>
        )}
      </button>

      {/* Children */}
      {isFolder && isExpanded && hasChildren && (
        <div>
          {item.children!.map((child, index) => (
            <TreeItem
              key={index}
              item={child}
              depth={depth + 1}
              defaultExpanded={defaultExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({
  items,
  title,
  defaultExpanded = true,
  className,
}: FileTreeProps) {
  return (
    <div
      className={cn(
        "my-6 rounded-xl overflow-hidden",
        "border border-border/50",
        "bg-card/30",
        className
      )}
    >
      {/* Header */}
      {title && (
        <div
          className={cn(
            "px-4 py-2",
            "bg-muted/50 border-b border-border/50",
            "text-sm font-medium"
          )}
        >
          {title}
        </div>
      )}

      {/* Tree */}
      <div className="p-2 font-mono">
        {items.map((item, index) => (
          <TreeItem
            key={index}
            item={item}
            defaultExpanded={defaultExpanded}
          />
        ))}
      </div>
    </div>
  );
}
