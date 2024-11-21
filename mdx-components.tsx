// mdx-components.tsx

import type { MDXComponents } from 'mdx/types';
import Image, { ImageProps } from "next/legacy/image";
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Import shadcn/ui components
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip } from '@/components/ui/tooltip';

// Custom components and hooks
import GistWrapper from '@/components/GistWrapper';
import ClientSideLink from '@/components/ClientSideLink';
import TagLink from '@/components/TagLink';

import React from 'react';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  // Base color classes for light and dark modes
  const baseTextColor = 'text-gray-900 dark:text-white';
  const baseSubTextColor = 'text-gray-700 dark:text-gray-300';

  // Common Heading component to handle h1 to h6
  const Heading = ({
    level,
    children,
  }: {
    level: number;
    children: React.ReactNode;
  }) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    const sizes = {
      1: 'text-4xl lg:text-5xl',
      2: 'text-3xl',
      3: 'text-2xl',
      4: 'text-xl',
      5: 'text-lg',
      6: 'text-base',
    };
    const marginTop = level === 1 ? 'mt-8' : 'mt-6';

    return (
      <Tag
        className={cn(
          marginTop,
          'scroll-m-20 font-semibold tracking-tight',
          sizes[level],
          baseTextColor,
          level <= 2
            ? 'bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500 bg-clip-text text-transparent'
            : '',
        )}
      >
        {children}
      </Tag>
    );
  };

  // List component to handle ordered and unordered lists
  const List = ({
    ordered,
    children,
  }: {
    ordered: boolean;
    children: React.ReactNode;
  }) => {
    const Tag = ordered ? 'ol' : 'ul';
    return (
      <Tag
        className={cn(
          ordered ? 'list-decimal' : 'list-disc',
          'list-inside space-y-2 my-4',
          baseSubTextColor,
        )}
      >
        {children}
      </Tag>
    );
  };

  // CodeBlock component for inline code and code blocks
  const CodeBlock = ({
    inline,
    className,
    children,
    ...props
  }: {
    inline?: boolean;
    className?: string;
    children: React.ReactNode;
  }) => {
    if (inline) {
      return (
        <code
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm font-semibold text-accent dark:bg-gray-800 dark:text-gray-300"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre
        className={cn(
          'my-6 overflow-x-auto rounded-lg bg-black p-4 text-white shadow-lg dark:bg-gray-900 dark:text-gray-300',
          className,
        )}
        {...props}
      >
        <code>{children}</code>
      </pre>
    );
  };

  // TableCell component for table headers and cells
  const TableCell = ({
    header,
    children,
  }: {
    header?: boolean;
    children: React.ReactNode;
  }) => {
    const Tag = header ? 'th' : 'td';
    return (
      <Tag
        className={cn(
          'border px-4 py-2 align-top',
          header ? 'font-bold text-left' : '',
          'dark:border-gray-700',
        )}
      >
        {children}
      </Tag>
    );
  };

  return {
    /** Headings */
    h1: ({ children }) => <Heading level={1}>{children}</Heading>,
    h2: ({ children }) => <Heading level={2}>{children}</Heading>,
    h3: ({ children }) => <Heading level={3}>{children}</Heading>,
    h4: ({ children }) => <Heading level={4}>{children}</Heading>,
    h5: ({ children }) => <Heading level={5}>{children}</Heading>,
    h6: ({ children }) => <Heading level={6}>{children}</Heading>,

    /** Paragraph */
    p: ({ children }) => (
      <p className={cn('leading-7 mt-6', baseSubTextColor)}>{children}</p>
    ),

    /** Image */
    img: (props) => {
      const { width = 600, height = 400, ...rest } = props;
      return (
        <div className="my-6 flex justify-center">
          <Image
            className="rounded-lg shadow-md dark:shadow-none"
            alt={props.alt || ''}
            width={width}
            height={height}
            layout="responsive"
            {...(rest as ImageProps)}
          />
        </div>
      );
    },

    /** Anchor */
    a: ({ href, children, ...props }) => {
      if (!href) return <span {...props}>{children}</span>;

      const isExternal = href.startsWith('http');
      if (isExternal) {
        return (
          <ClientSideLink href={href} isExternal {...props}>
            {children}
          </ClientSideLink>
        );
      }

      return (
        <Link href={href} {...props}>
          <span className="underline decoration-dotted underline-offset-4 hover:decoration-solid text-blue-600 dark:text-blue-400">
            {children}
          </span>
        </Link>
      );
    },

    /** Lists */
    ul: ({ children }) => <List ordered={false}>{children}</List>,
    ol: ({ children }) => <List ordered={true}>{children}</List>,
    li: ({ children }) => (
      <li className={cn(baseSubTextColor)}>{children}</li>
    ),

    /** Blockquote */
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-gray-700 dark:text-gray-300">
        {children}
      </blockquote>
    ),

    /** Code and Preformatted Text */
    code: ({ className, children, ...props }) => {
      const inline = !className;
      return (
        <CodeBlock inline={inline} className={className} {...props}>
          {children}
        </CodeBlock>
      );
    },
    pre: ({ children, className, ...props }) => (
      <CodeBlock className={className} {...props}>
        {children}
      </CodeBlock>
    ),

    /** Table */
    table: ({ children }) => (
      <div className="my-6 w-full overflow-x-auto">
        <table className="w-full border-collapse dark:border-gray-700">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-muted text-left font-semibold dark:bg-gray-800">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y dark:divide-gray-700">{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="border-t dark:border-gray-700">{children}</tr>
    ),
    th: ({ children }) => <TableCell header>{children}</TableCell>,
    td: ({ children }) => <TableCell>{children}</TableCell>,

    /** Horizontal Rule */
    hr: () => <Separator className="my-8 dark:border-gray-700" />,

    /** Other Text Formatting */
    strong: ({ children }) => (
      <strong className={cn('font-semibold', baseTextColor)}>
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className={cn('italic', baseSubTextColor)}>{children}</em>
    ),
    del: ({ children }) => (
      <del className="line-through text-gray-500 dark:text-gray-400">
        {children}
      </del>
    ),

    /** Superscript and Subscript */
    sup: ({ children }) => (
      <sup className="align-super text-xs text-gray-700 dark:text-gray-300">
        {children}
      </sup>
    ),
    sub: ({ children }) => (
      <sub className="align-sub text-xs text-gray-700 dark:text-gray-300">
        {children}
      </sub>
    ),

    /** Figures */
    figure: ({ children }) => (
      <figure className="my-4 text-center text-gray-700 dark:text-gray-300">
        {children}
      </figure>
    ),
    figcaption: ({ children }) => (
      <figcaption className="mt-2 text-sm italic text-gray-500 dark:text-gray-400">
        {children}
      </figcaption>
    ),

    /** Gist Integration */
    Gist: ({ url }) => <GistWrapper url={url} className="my-4" />,

    /** Custom Components */
    Alert,
    Badge,
    Button,
    Card,
    Tooltip,

    /** Additional Components */
    ClientSideLink,
    TagLink: ({
      tag,
      count,
      showCount,
    }: {
      tag: string;
      count?: number;
      showCount?: boolean;
    }) => <TagLink tag={tag} count={count} showCount={showCount} />,
    ...components,
  };
}
