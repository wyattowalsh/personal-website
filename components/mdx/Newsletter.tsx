"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Mail, Check, Loader2, AlertCircle } from "lucide-react";

interface NewsletterProps {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  endpoint?: string;
  className?: string;
}

type Status = "idle" | "loading" | "success" | "error";

export default function Newsletter({
  title = "Subscribe to the newsletter",
  description = "Get notified about new posts and updates.",
  placeholder = "Enter your email",
  buttonText = "Subscribe",
  successMessage = "Thanks for subscribing! Check your inbox to confirm.",
  endpoint = "/api/newsletter",
  className,
}: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!email || !email.includes("@")) {
        setStatus("error");
        setErrorMessage("Please enter a valid email address");
        return;
      }

      setStatus("loading");
      setErrorMessage("");

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error("Failed to subscribe");
        }

        setStatus("success");
        setEmail("");
      } catch {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    },
    [email, endpoint]
  );

  if (status === "success") {
    return (
      <div
        className={cn(
          "my-6 p-6 rounded-xl",
          "border border-green-500/30",
          "bg-green-500/5",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full",
              "bg-green-500/20",
              "flex items-center justify-center"
            )}
          >
            <Check className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h4 className="font-semibold text-green-500">You're subscribed!</h4>
            <p className="text-sm text-muted-foreground">{successMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "my-6 p-6 rounded-xl",
        "border border-border/50",
        "bg-gradient-to-br from-primary/5 via-transparent to-transparent",
        className
      )}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex-shrink-0",
            "bg-primary/20",
            "flex items-center justify-center"
          )}
        >
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder={placeholder}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg",
            "bg-background border",
            "text-sm",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-all duration-200",
            status === "error"
              ? "border-red-500 focus:ring-red-500"
              : "border-border/50"
          )}
          disabled={status === "loading"}
          aria-invalid={status === "error"}
        />

        <button
          type="submit"
          disabled={status === "loading" || !email}
          className={cn(
            "px-4 py-2 rounded-lg",
            "bg-primary text-primary-foreground",
            "text-sm font-medium",
            "hover:bg-primary/90",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "inline-flex items-center gap-2"
          )}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Subscribing...
            </>
          ) : (
            buttonText
          )}
        </button>
      </form>

      {/* Error message */}
      {status === "error" && errorMessage && (
        <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      <p className="text-xs text-muted-foreground/70 mt-3">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
