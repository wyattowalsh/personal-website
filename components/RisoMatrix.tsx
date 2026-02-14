"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TemplatePrompt {
  key: string;
  type: string | null;
  choices: string[] | null;
  default: string | boolean | string[] | null;
  help: string | null;
  when: string | null;
}

interface MatrixData {
  generated_at: string;
  template: {
    metadata: {
      name: string;
      version: string;
      description: string;
    };
    prompts: TemplatePrompt[];
    defaults: Record<string, unknown>;
  };
  samples: {
    variants?: Array<{ variant: string }>;
    render_matrix?: Record<string, unknown>;
  };
}

const MATRIX_URL =
  "https://raw.githubusercontent.com/wyattowalsh/riso/main/samples/metadata/matrix-data.json";

const COPIER_URL =
  "https://raw.githubusercontent.com/wyattowalsh/riso/main/template/copier.yml";

// Core module prompts to display
const CORE_MODULES = [
  "project_layout",
  "quality_profile",
  "cli_module",
  "api_tracks",
  "graphql_api_module",
  "websocket_module",
  "mcp_module",
  "docs_site",
  "changelog_module",
  "saas_starter_module",
];

// SaaS stack categories
const SAAS_CATEGORIES = [
  "saas_runtime",
  "saas_hosting",
  "saas_database",
  "saas_orm",
  "saas_auth",
  "saas_billing",
  "saas_jobs",
  "saas_email",
  "saas_analytics",
  "saas_ai",
  "saas_storage",
  "saas_cicd",
];

function formatKey(key: string): string {
  return key
    .replace(/^(saas_|fumadocs_|docusaurus_)/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatChoices(choices: string[] | null): string {
  if (!choices) return "—";
  return choices.join(", ");
}

export function RisoModuleMatrix() {
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Try matrix-data.json first
        let response = await fetch(MATRIX_URL);
        if (response.ok) {
          const json = await response.json();
          setData(json);
          return;
        }

        // Fallback: parse copier.yml directly (simplified)
        response = await fetch(COPIER_URL);
        if (!response.ok) {
          throw new Error("Could not fetch template configuration");
        }
        // For copier.yml, we'd need a YAML parser - skip for now
        setError("Matrix data not available");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="my-8 p-4 rounded-xl border border-border-50 bg-card-50 dark:bg-card-30">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null; // Fail silently, the static table is already in the post
  }

  const corePrompts = data.template.prompts.filter((p) =>
    CORE_MODULES.includes(p.key)
  );

  const generatedDate = new Date(data.generated_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <div className="my-8 space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Live from{" "}
          <code className="text-xs px-1 py-0.5 bg-muted rounded">
            matrix-data.json
          </code>
        </span>
        <span>Updated: {generatedDate}</span>
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-xl",
          "border border-border-50",
          "bg-card-50 dark:bg-card-30"
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted-30 dark:bg-card-30">
                <th className="p-4 text-left font-medium border-b border-border-50">
                  Module
                </th>
                <th className="p-4 text-left font-medium border-b border-border-50">
                  Options
                </th>
                <th className="p-4 text-left font-medium border-b border-border-50">
                  Default
                </th>
              </tr>
            </thead>
            <tbody>
              {corePrompts.map((prompt) => (
                <tr
                  key={prompt.key}
                  className="hover:bg-muted-50 dark:hover:bg-card-50 transition-colors"
                >
                  <td className="p-4 border-b border-border-20 font-mono text-sm">
                    {prompt.key}
                  </td>
                  <td className="p-4 border-b border-border-20 text-sm">
                    {formatChoices(prompt.choices)}
                  </td>
                  <td className="p-4 border-b border-border-20 text-sm">
                    <code className="text-xs px-1.5 py-0.5 bg-muted rounded">
                      {String(
                        data.template.defaults[prompt.key] ?? prompt.default
                      )}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function RisoSaaSStack() {
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(MATRIX_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="my-8 p-4 rounded-xl border border-border-50 bg-card-50 dark:bg-card-30">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-full" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const saasPrompts = data.template.prompts.filter((p) =>
    SAAS_CATEGORIES.includes(p.key)
  );

  return (
    <div className="my-8 space-y-4">
      <div
        className={cn(
          "overflow-hidden rounded-xl",
          "border border-border-50",
          "bg-card-50 dark:bg-card-30"
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted-30 dark:bg-card-30">
                <th className="p-4 text-left font-medium border-b border-border-50">
                  Category
                </th>
                <th className="p-4 text-left font-medium border-b border-border-50">
                  Options
                </th>
                <th className="p-4 text-left font-medium border-b border-border-50">
                  Default
                </th>
              </tr>
            </thead>
            <tbody>
              {saasPrompts.map((prompt) => (
                <tr
                  key={prompt.key}
                  className="hover:bg-muted-50 dark:hover:bg-card-50 transition-colors"
                >
                  <td className="p-4 border-b border-border-20 font-medium">
                    {formatKey(prompt.key)}
                  </td>
                  <td className="p-4 border-b border-border-20 text-sm">
                    {formatChoices(prompt.choices)}
                  </td>
                  <td className="p-4 border-b border-border-20 text-sm">
                    <code className="text-xs px-1.5 py-0.5 bg-muted rounded">
                      {String(
                        data.template.defaults[prompt.key] ?? prompt.default
                      )}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function RisoSampleVariants() {
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(MATRIX_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data?.samples?.variants) return null;

  return (
    <div className="my-8">
      <div className="flex flex-wrap gap-2">
        {data.samples.variants.map(({ variant }) => (
          <span
            key={variant}
            className={cn(
              "px-3 py-1 rounded-full text-sm",
              "bg-primary/10 text-primary",
              "border border-primary/20",
              "hover:bg-primary/20 transition-colors"
            )}
          >
            {variant}
          </span>
        ))}
      </div>
    </div>
  );
}
