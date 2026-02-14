"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, Copy, Check, Circle } from "lucide-react";

interface TerminalLine {
  text: string;
  type?: "command" | "output" | "error" | "success" | "comment";
  delay?: number; // Delay before this line starts (ms)
  typing?: boolean; // Whether to animate typing
}

interface TerminalProps {
  lines: TerminalLine[];
  title?: string;
  prompt?: string;
  typingSpeed?: number; // ms per character
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
}

export default function Terminal({
  lines,
  title = "Terminal",
  prompt = "$",
  typingSpeed = 30,
  autoPlay = true,
  loop = false,
  className,
}: TerminalProps) {
  const [displayedLines, setDisplayedLines] = useState<
    { text: string; type: string; complete: boolean }[]
  >([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isComplete, setIsComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setDisplayedLines([]);
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);
    setIsComplete(false);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (isComplete && !isPlaying) {
      reset();
    } else {
      setIsPlaying(!isPlaying);
    }
  }, [isComplete, isPlaying, reset]);

  const copyCommands = useCallback(() => {
    const commands = lines
      .filter((line) => line.type === "command" || !line.type)
      .map((line) => line.text)
      .join("\n");

    navigator.clipboard.writeText(commands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [lines]);

  // Typing animation effect
  useEffect(() => {
    if (!isPlaying || isComplete) return;
    if (currentLineIndex >= lines.length) {
      setIsComplete(true);
      setIsPlaying(false);
      if (loop) {
        setTimeout(reset, 2000);
      }
      return;
    }

    const currentLine = lines[currentLineIndex];
    const lineType = currentLine.type || "command";
    const shouldType = currentLine.typing !== false && lineType === "command";

    // Handle delay before line
    if (currentCharIndex === 0 && currentLine.delay) {
      const delayTimer = setTimeout(() => {
        setCurrentCharIndex(1);
      }, currentLine.delay);
      return () => clearTimeout(delayTimer);
    }

    // Non-typing lines appear instantly
    if (!shouldType) {
      setDisplayedLines((prev) => [
        ...prev,
        { text: currentLine.text, type: lineType, complete: true },
      ]);
      setCurrentLineIndex((prev) => prev + 1);
      setCurrentCharIndex(0);
      return;
    }

    // Typing animation
    if (currentCharIndex <= currentLine.text.length) {
      // Add or update current line
      setDisplayedLines((prev) => {
        const newLines = [...prev];
        const lineData = {
          text: currentLine.text.slice(0, currentCharIndex),
          type: lineType,
          complete: currentCharIndex === currentLine.text.length,
        };

        if (newLines.length === currentLineIndex) {
          newLines.push(lineData);
        } else {
          newLines[currentLineIndex] = lineData;
        }

        return newLines;
      });

      if (currentCharIndex < currentLine.text.length) {
        const timer = setTimeout(() => {
          setCurrentCharIndex((prev) => prev + 1);
        }, typingSpeed);
        return () => clearTimeout(timer);
      } else {
        // Line complete, move to next
        const timer = setTimeout(() => {
          setCurrentLineIndex((prev) => prev + 1);
          setCurrentCharIndex(0);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isPlaying, isComplete, currentLineIndex, currentCharIndex, lines, typingSpeed, loop, reset]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedLines]);

  const getLineStyles = (type: string) => {
    switch (type) {
      case "command":
        return "text-green-400";
      case "output":
        return "text-slate-300";
      case "error":
        return "text-red-400";
      case "success":
        return "text-emerald-400";
      case "comment":
        return "text-slate-500 italic";
      default:
        return "text-slate-300";
    }
  };

  return (
    <div
      className={cn(
        "my-6 rounded-xl overflow-hidden",
        "border border-slate-700",
        "bg-slate-900",
        "font-mono text-sm",
        className
      )}
    >
      {/* Title bar */}
      <div
        className={cn(
          "flex items-center justify-between",
          "px-4 py-2",
          "bg-slate-800 border-b border-slate-700"
        )}
      >
        <div className="flex items-center gap-2">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-slate-400 text-xs ml-2">{title}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className={cn(
              "p-1.5 rounded",
              "hover:bg-slate-700 transition-colors",
              "text-slate-400 hover:text-slate-200"
            )}
            title={isPlaying ? "Pause" : isComplete ? "Replay" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : isComplete ? (
              <RotateCcw className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          {/* Reset */}
          <button
            onClick={reset}
            className={cn(
              "p-1.5 rounded",
              "hover:bg-slate-700 transition-colors",
              "text-slate-400 hover:text-slate-200"
            )}
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Copy */}
          <button
            onClick={copyCommands}
            className={cn(
              "p-1.5 rounded",
              "hover:bg-slate-700 transition-colors",
              "text-slate-400 hover:text-slate-200"
            )}
            title="Copy commands"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={containerRef}
        className={cn(
          "p-4 min-h-[120px] max-h-[400px]",
          "overflow-y-auto",
          "scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        )}
      >
        {displayedLines.map((line, index) => (
          <div key={index} className="flex items-start gap-2">
            {(line.type === "command" || !line.type) && (
              <span className="text-blue-400 select-none">{prompt}</span>
            )}
            <span className={getLineStyles(line.type)}>
              {line.text}
              {/* Cursor */}
              {!line.complete && index === displayedLines.length - 1 && (
                <span className="inline-block w-2 h-4 bg-green-400 ml-0.5 animate-pulse" />
              )}
            </span>
          </div>
        ))}

        {/* Idle cursor when complete */}
        {isComplete && (
          <div className="flex items-center gap-2">
            <span className="text-blue-400 select-none">{prompt}</span>
            <span className="inline-block w-2 h-4 bg-green-400 animate-pulse" />
          </div>
        )}

        {/* Waiting indicator */}
        {!isComplete && displayedLines.length === 0 && !isPlaying && (
          <div className="flex items-center gap-2 text-slate-500">
            <Circle className="w-3 h-3" />
            <span>Click play to start</span>
          </div>
        )}
      </div>
    </div>
  );
}
