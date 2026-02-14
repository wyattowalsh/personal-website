"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Play, Loader2 } from "lucide-react";
import Image from "next/image";

type VideoProvider = "youtube" | "vimeo";

interface VideoEmbedProps {
  url: string;
  title?: string;
  poster?: string;
  aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16";
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
}

function parseVideoUrl(url: string): { provider: VideoProvider; id: string } | null {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return { provider: "youtube", id: match[1] };
    }
  }

  // Vimeo patterns
  const vimeoPatterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of vimeoPatterns) {
    const match = url.match(pattern);
    if (match) {
      return { provider: "vimeo", id: match[1] };
    }
  }

  return null;
}

function getEmbedUrl(
  provider: VideoProvider,
  id: string,
  autoplay: boolean,
  muted: boolean,
  loop: boolean
): string {
  const params = new URLSearchParams();

  if (provider === "youtube") {
    if (autoplay) params.set("autoplay", "1");
    if (muted) params.set("mute", "1");
    if (loop) {
      params.set("loop", "1");
      params.set("playlist", id);
    }
    params.set("rel", "0"); // Don't show related videos
    return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
  }

  if (provider === "vimeo") {
    if (autoplay) params.set("autoplay", "1");
    if (muted) params.set("muted", "1");
    if (loop) params.set("loop", "1");
    params.set("dnt", "1"); // Do not track
    return `https://player.vimeo.com/video/${id}?${params.toString()}`;
  }

  return "";
}

function getThumbnailUrl(provider: VideoProvider, id: string): string {
  if (provider === "youtube") {
    return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  }
  // Vimeo thumbnails require an API call, so we return empty
  return "";
}

export default function VideoEmbed({
  url,
  title = "Video",
  poster,
  aspectRatio = "16:9",
  autoplay = false,
  muted = false,
  loop = false,
  className,
}: VideoEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(autoplay);
  const [isLoading, setIsLoading] = useState(false);

  const videoInfo = parseVideoUrl(url);

  const handlePlay = useCallback(() => {
    setIsLoading(true);
    setIsLoaded(true);
  }, []);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  if (!videoInfo) {
    return (
      <div
        className={cn(
          "my-6 p-4 rounded-xl",
          "bg-destructive/10 border border-destructive/20",
          "text-destructive text-sm",
          className
        )}
      >
        Invalid video URL. Supported: YouTube, Vimeo
      </div>
    );
  }

  const aspectClasses = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
    "9:16": "aspect-[9/16]",
  };

  const thumbnailUrl = poster || getThumbnailUrl(videoInfo.provider, videoInfo.id);
  const embedUrl = getEmbedUrl(videoInfo.provider, videoInfo.id, autoplay || isLoaded, muted, loop);

  return (
    <div className={cn("my-6", className)}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl",
          "bg-muted",
          aspectClasses[aspectRatio]
        )}
      >
        {!isLoaded ? (
          // Thumbnail with play button
          <button
            onClick={handlePlay}
            className={cn(
              "absolute inset-0 w-full h-full",
              "group cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            aria-label={`Play ${title}`}
          >
            {/* Thumbnail */}
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20" />
            )}

            {/* Overlay */}
            <div
              className={cn(
                "absolute inset-0",
                "bg-black/30 group-hover:bg-black/40",
                "transition-colors duration-300"
              )}
            />

            {/* Play button */}
            <div
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                "w-16 h-16 sm:w-20 sm:h-20",
                "rounded-full",
                "bg-primary/90 group-hover:bg-primary",
                "flex items-center justify-center",
                "transition-all duration-300",
                "group-hover:scale-110",
                "shadow-lg shadow-primary/30"
              )}
            >
              <Play className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground ml-1" />
            </div>

            {/* Title */}
            {title && (
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0",
                  "p-4 bg-gradient-to-t from-black/60 to-transparent"
                )}
              >
                <p className="text-white font-medium truncate">{title}</p>
                <p className="text-white/70 text-sm capitalize">
                  {videoInfo.provider}
                </p>
              </div>
            )}
          </button>
        ) : (
          // Iframe
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
              className={cn(
                "absolute inset-0 w-full h-full",
                isLoading && "opacity-0"
              )}
            />
          </>
        )}
      </div>
    </div>
  );
}
