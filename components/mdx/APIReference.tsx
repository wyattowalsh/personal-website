"use client";

import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

interface Parameter {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  default?: string;
}

interface APIReferenceProps {
  method: HttpMethod;
  endpoint: string;
  title?: string;
  description?: string;
  parameters?: Parameter[];
  requestBody?: {
    type: string;
    example?: string;
  };
  response?: {
    status: number;
    description?: string;
    example?: string;
  };
  headers?: Parameter[];
  authentication?: string;
  className?: string;
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-green-500/20 text-green-500 border-green-500/30",
  POST: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  PUT: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  PATCH: "bg-orange-500/20 text-orange-500 border-orange-500/30",
  DELETE: "bg-red-500/20 text-red-500 border-red-500/30",
  HEAD: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  OPTIONS: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export default function APIReference({
  method,
  endpoint,
  title,
  description,
  parameters,
  requestBody,
  response,
  headers,
  authentication,
  className,
}: APIReferenceProps) {
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const copyToClipboard = useCallback(
    async (text: string, setCopied: (v: boolean) => void) => {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    []
  );

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
      <div className="p-4 border-b border-border/50">
        {/* Method + Endpoint */}
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-bold uppercase border",
              METHOD_COLORS[method]
            )}
          >
            {method}
          </span>

          <div className="flex-1 flex items-center gap-2 min-w-0">
            <code className="text-sm font-mono truncate">{endpoint}</code>
            <button
              onClick={() => copyToClipboard(endpoint, setCopiedEndpoint)}
              className={cn(
                "p-1 rounded hover:bg-muted transition-colors",
                "text-muted-foreground hover:text-foreground"
              )}
              title="Copy endpoint"
            >
              {copiedEndpoint ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Title & Description */}
        {(title || description) && (
          <div className="mt-3">
            {title && <h4 className="font-semibold">{title}</h4>}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        )}

        {/* Authentication */}
        {authentication && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Auth:</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
              {authentication}
            </span>
          </div>
        )}
      </div>

      {/* Parameters */}
      {parameters && parameters.length > 0 && (
        <div className="p-4 border-b border-border/50">
          <h5 className="text-sm font-medium mb-3">Parameters</h5>
          <div className="space-y-2">
            {parameters.map((param, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 p-2 rounded-lg",
                  "bg-muted/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-primary">{param.name}</code>
                  {param.required && (
                    <span className="text-xs text-red-500">*required</span>
                  )}
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {param.type}
                </span>
                {param.default && (
                  <span className="text-xs text-muted-foreground">
                    = {param.default}
                  </span>
                )}
                {param.description && (
                  <span className="text-sm text-muted-foreground flex-1">
                    {param.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Headers */}
      {headers && headers.length > 0 && (
        <div className="p-4 border-b border-border/50">
          <h5 className="text-sm font-medium mb-3">Headers</h5>
          <div className="space-y-2">
            {headers.map((header, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-sm"
              >
                <code className="font-mono text-primary">{header.name}</code>
                <span className="text-muted-foreground">:</span>
                <span className="text-muted-foreground">{header.description}</span>
                {header.required && (
                  <span className="text-xs text-red-500">*required</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Body */}
      {requestBody && (
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium">Request Body</h5>
            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {requestBody.type}
            </span>
          </div>
          {requestBody.example && (
            <div className="relative">
              <pre
                className={cn(
                  "p-3 rounded-lg overflow-x-auto",
                  "bg-slate-900 text-slate-300",
                  "text-xs font-mono"
                )}
              >
                {requestBody.example}
              </pre>
              <button
                onClick={() =>
                  copyToClipboard(requestBody.example!, setCopiedBody)
                }
                className={cn(
                  "absolute top-2 right-2",
                  "p-1.5 rounded hover:bg-slate-700 transition-colors",
                  "text-slate-400 hover:text-slate-200"
                )}
              >
                {copiedBody ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium">Response</h5>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded border",
                response.status >= 200 && response.status < 300
                  ? "bg-green-500/20 text-green-500 border-green-500/30"
                  : response.status >= 400
                  ? "bg-red-500/20 text-red-500 border-red-500/30"
                  : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
              )}
            >
              {response.status}
            </span>
          </div>
          {response.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {response.description}
            </p>
          )}
          {response.example && (
            <div className="relative">
              <pre
                className={cn(
                  "p-3 rounded-lg overflow-x-auto",
                  "bg-slate-900 text-slate-300",
                  "text-xs font-mono"
                )}
              >
                {response.example}
              </pre>
              <button
                onClick={() =>
                  copyToClipboard(response.example!, setCopiedResponse)
                }
                className={cn(
                  "absolute top-2 right-2",
                  "p-1.5 rounded hover:bg-slate-700 transition-colors",
                  "text-slate-400 hover:text-slate-200"
                )}
              >
                {copiedResponse ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
