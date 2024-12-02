"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cva, VariantProps } from "class-variance-authority";

// Omit color from HTMLAttributes to avoid conflict
type BaseSpinnerProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>;

interface LoadingSpinnerProps
  extends BaseSpinnerProps,
    VariantProps<typeof spinnerVariants> {
  message?: string;
}

const spinnerVariants = cva(
  "relative flex justify-center items-center transition-all duration-300",
  {
    variants: {
      variant: {
        glitch: "glitch-base glitch-effect",
        ring: "ring-effect",
        cube: "cube-spinner",
        pulse: "pulse-effect",
        wave: "wave-effect",
      },
      size: {
        sm: "h-12 w-12",
        md: "h-16 w-16",
        lg: "h-24 w-24",
      },
      color: {
        primary: "text-primary",
        accent: "text-accent",
        secondary: "text-secondary",
        gradient: "text-gradient",
      },
    },
    defaultVariants: {
      variant: "glitch",
      size: "md",
      color: "primary",
    },
  }
);

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant,
  size,
  color,
  message = "Loading",
  className,
  ...props
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          "spinner",
          "flex flex-col items-center gap-4",
          "p-6 rounded-xl",
          "bg-background/50 dark:bg-background/30",
          "backdrop-blur-lg",
          "border border-primary/10 dark:border-primary/5",
          "shadow-xl shadow-primary/5 dark:shadow-primary/10",
          className
        )}
        {...props}
      >
        <Spinner variant={variant} size={size} color={color} message={message} />
        {message && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "text-sm font-medium",
              "text-foreground/80 dark:text-foreground/70",
              "animate-pulse"
            )}
          >
            {message}
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const Spinner: React.FC<LoadingSpinnerProps> = ({
  variant,
  size,
  color,
  message,
}) => {
  switch (variant) {
    case "glitch":
      return (
        <motion.div
          className={spinnerVariants({ variant, size, color })}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{
            scale: [0.8, 1, 0.8],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Loader2
            className={cn(
              "animate-spin",
              spinnerVariants({ size, color })
            )}
          />
          <div className="glitch-layer-1" />
          <div className="glitch-layer-2" />
        </motion.div>
      );

    case "ring":
      return (
        <motion.div
          className={cn(
            "relative",
            spinnerVariants({ size }),
            "before:absolute before:inset-0",
            "before:rounded-full before:border-4",
            "before:border-primary/20 dark:before:border-primary/10"
          )}
        >
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full",
              "border-4 border-transparent",
              "border-t-primary border-r-primary",
              "animate-spin"
            )}
            style={{ animationDuration: "1.5s" }}
          />
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full",
              "border-4 border-transparent",
              "border-b-primary/50 border-l-primary/50",
              "animate-spin"
            )}
            style={{ animationDuration: "2s", animationDirection: "reverse" }}
          />
        </motion.div>
      );

    case "cube":
      return (
        <div className="cube-spinner">
          <motion.div
            className="cube"
            animate={{
              rotateX: [0, 360],
              rotateY: [0, 360],
              rotateZ: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      );

    case "pulse":
      return (
        <motion.div
          className={cn(
            spinnerVariants({ size }),
            "relative grid place-items-center"
          )}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "absolute rounded-full",
                "border-2 border-primary",
                "animate-ping"
              )}
              style={{
                width: "100%",
                height: "100%",
                animationDelay: `${i * 0.3}s`,
                opacity: 1 - i * 0.2,
              }}
            />
          ))}
          <Loader2
            className={cn(
              "relative z-10",
              "animate-spin",
              spinnerVariants({ size, color })
            )}
          />
        </motion.div>
      );

    case "wave":
      return (
        <motion.div
          className={cn(
            spinnerVariants({ size }),
            "flex items-center gap-1"
          )}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full",
                "bg-primary dark:bg-primary/80"
              )}
              animate={{
                y: ["0%", "-50%", "0%"],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      );

    default:
      return null;
  }
};

export default LoadingSpinner;
