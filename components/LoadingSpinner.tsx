"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cva, VariantProps } from "class-variance-authority";
import styles from "./loadingspinner.module.scss";

interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  message?: string;
}

const spinnerVariants = cva("relative flex justify-center items-center", {
  variants: {
    variant: {
      glitch: "glitch-base",
      ring: "ring-base",
      cube: "cube-base",
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
    },
  },
  defaultVariants: {
    variant: "glitch",
    size: "md",
    color: "primary",
  },
});

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant,
  size,
  color,
  message = "Loading",
  className,
  ...props
}) => {
  return (
    <div className={cn("flex flex-col items-center", className)} {...props}>
      <Spinner variant={variant} size={size} color={color} message={message} />
      {message && (
        <span className="mt-4 text-sm text-center animate-pulse">{message}</span>
      )}
    </div>
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
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, repeat: Infinity }}
          data-text={message}
        >
          <Loader2
            className={cn(
              "animate-spin text-primary-foreground",
              spinnerVariants({ size, color })
            )}
          />
          <div
            className="absolute inset-0 glitch-layer-1"
            data-text={message}
          ></div>
          <div
            className="absolute inset-0 glitch-layer-2"
            data-text={message}
          ></div>
        </motion.div>
      );
    case "ring":
      return (
        <div className={cn("relative", spinnerVariants({ size }))}>
          <motion.div
            className={cn(
              "absolute inset-0 border-4 border-t-transparent border-b-transparent rounded-full",
              color
            )}
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "linear",
            }}
          />
          <Loader2
            className={cn(
              "absolute inset-0 m-auto text-primary-foreground",
              spinnerVariants({ size, color })
            )}
          />
        </div>
      );
    case "cube":
      return (
        <div className={styles["cube-spinner"]}>
          <div className={styles["cube"]}></div>
        </div>
      );
    default:
      return null;
  }
};
