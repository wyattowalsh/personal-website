declare module 'js-yaml' {
  export interface LoadOptions {
    filename?: string;
    schema?: unknown;
    json?: boolean;
    onWarning?: (warning: Error) => void;
  }

  export interface DumpOptions {
    indent?: number;
    lineWidth?: number;
    noRefs?: boolean;
    sortKeys?: boolean | ((left: string, right: string) => number);
  }

  export function load<T = unknown>(source: string, options?: LoadOptions): T;
  export function dump(value: unknown, options?: DumpOptions): string;
}
