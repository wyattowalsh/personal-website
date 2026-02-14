"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, Grid } from "lucide-react";

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  aspectRatio?: "square" | "video" | "auto";
  title?: string;
  className?: string;
}

export default function ImageGallery({
  images,
  columns = 3,
  gap = "md",
  aspectRatio = "auto",
  title,
  className,
}: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const isOpen = lightboxIndex !== null;
  const currentImage = isOpen ? images[lightboxIndex] : null;

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setIsZoomed(false);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    setIsZoomed(false);
    document.body.style.overflow = "";
  }, []);

  const goToPrevious = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    setIsZoomed(false);
  }, [lightboxIndex, images.length]);

  const goToNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % images.length);
    setIsZoomed(false);
  }, [lightboxIndex, images.length]);

  const toggleZoom = useCallback(() => {
    setIsZoomed(!isZoomed);
  }, [isZoomed]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case " ":
          e.preventDefault();
          toggleZoom();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeLightbox, goToPrevious, goToNext, toggleZoom]);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    touchStartX.current = null;
  };

  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const columnClasses = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  };

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "aspect-auto",
  };

  return (
    <>
      <div className={cn("my-8", className)}>
        {title && (
          <div className="flex items-center gap-2 mb-4">
            <Grid className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>
        )}

        {/* Grid */}
        <div className={cn("grid", columnClasses[columns], gapClasses[gap])}>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className={cn(
                "relative group overflow-hidden rounded-lg",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "transition-all duration-300",
                aspectClasses[aspectRatio]
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill={aspectRatio !== "auto"}
                width={aspectRatio === "auto" ? image.width || 400 : undefined}
                height={aspectRatio === "auto" ? image.height || 300 : undefined}
                className={cn(
                  "object-cover transition-transform duration-500",
                  "group-hover:scale-110",
                  aspectRatio === "auto" && "relative !h-auto"
                )}
              />

              {/* Hover overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-black/0 group-hover:bg-black/40",
                  "flex items-center justify-center",
                  "transition-all duration-300",
                  "opacity-0 group-hover:opacity-100"
                )}
              >
                <ZoomIn className="w-8 h-8 text-white" />
              </div>

              {/* Caption preview */}
              {image.caption && (
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0",
                    "p-2 bg-gradient-to-t from-black/60 to-transparent",
                    "text-white text-sm truncate",
                    "translate-y-full group-hover:translate-y-0",
                    "transition-transform duration-300"
                  )}
                >
                  {image.caption}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {isOpen && currentImage && (
        <div
          ref={lightboxRef}
          className={cn(
            "fixed inset-0 z-50",
            "bg-black/95 backdrop-blur-sm",
            "flex items-center justify-center"
          )}
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className={cn(
              "absolute top-4 right-4 z-10",
              "p-2 rounded-full",
              "bg-white/10 hover:bg-white/20",
              "text-white transition-colors"
            )}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 z-10",
                  "p-2 rounded-full",
                  "bg-white/10 hover:bg-white/20",
                  "text-white transition-colors"
                )}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 z-10",
                  "p-2 rounded-full",
                  "bg-white/10 hover:bg-white/20",
                  "text-white transition-colors"
                )}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative max-w-[90vw] max-h-[80vh]",
              "transition-transform duration-300",
              isZoomed && "scale-150 cursor-zoom-out"
            )}
          >
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              width={currentImage.width || 1200}
              height={currentImage.height || 800}
              className={cn(
                "max-w-full max-h-[80vh] object-contain",
                !isZoomed && "cursor-zoom-in"
              )}
              onClick={toggleZoom}
              priority
            />
          </div>

          {/* Caption and controls */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0",
              "p-4 bg-gradient-to-t from-black/80 to-transparent"
            )}
          >
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div>
                {currentImage.caption && (
                  <p className="text-white text-sm">{currentImage.caption}</p>
                )}
                <p className="text-white/60 text-xs mt-1">
                  {lightboxIndex! + 1} / {images.length}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleZoom();
                  }}
                  className={cn(
                    "p-2 rounded-full",
                    "bg-white/10 hover:bg-white/20",
                    "text-white transition-colors"
                  )}
                >
                  <ZoomIn className="w-5 h-5" />
                </button>

                <a
                  href={currentImage.src}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "p-2 rounded-full",
                    "bg-white/10 hover:bg-white/20",
                    "text-white transition-colors"
                  )}
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(index);
                      setIsZoomed(false);
                    }}
                    className={cn(
                      "relative w-16 h-16 flex-shrink-0 rounded overflow-hidden",
                      "transition-all duration-200",
                      index === lightboxIndex
                        ? "ring-2 ring-white opacity-100"
                        : "opacity-50 hover:opacity-75"
                    )}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
