// mdx-components.tsx

import type { MDXComponents } from 'mdx/types';
import Image, { ImageProps } from 'next/image';
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
import Math from '@/components/Math';

import React from 'react';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  // Enhanced base colors with better contrast
  const baseTextColor = 'text-gray-900 dark:text-gray-50';
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
      1: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl',
      2: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl',
      3: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
      4: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
      5: 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl',
      6: 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl',
    };

    return (
      <Tag
        className={cn(
          'scroll-m-20 font-semibold tracking-tight',
          'transition-colors duration-200',
          sizes[level],
          level <= 2
            ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent'
            : baseTextColor,
          'my-6 md:my-8 lg:my-10 xl:my-12'
        )}
      >
        {children}
      </Tag>
    );
  };

  // TableCell component for table headers and cells
  const TableCell = ({
    children,
    header = false,
  }: {
    children: React.ReactNode;
    header?: boolean;
  }) => {
    const CellTag = header ? 'th' : 'td';
    return (
      <CellTag
        className={cn(
          'border border-gray-300 dark:border-gray-700',
          'px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4',
          header
            ? 'bg-gray-100 dark:bg-gray-800 font-semibold text-gray-900 dark:text-gray-100'
            : 'text-gray-800 dark:text-gray-200',
          'transition-colors duration-200'
        )}
      >
        {children}
      </CellTag>
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
          'list-inside space-y-2 my-6 md:my-8 lg:my-10',
          'pl-6 md:pl-8 lg:pl-10',
          baseSubTextColor
        )}
      >
        {children}
      </Tag>
    );
  };

  // Enhanced CodeBlock component
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
          className={cn(
            'rounded-md px-2 py-1 font-mono text-sm font-medium',
            'bg-blue-50 dark:bg-blue-900/20',
            'text-blue-900 dark:text-blue-200',
            'border border-blue-200 dark:border-blue-800',
            'transition-all duration-200',
            'hover:bg-blue-100 dark:hover:bg-blue-900/30'
          )}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre
        className={cn(
          'my-6 md:my-8 lg:my-10',
          'p-4 sm:p-6 md:p-8 lg:p-10',
          'overflow-x-auto rounded-lg',
          'bg-gray-950 dark:bg-gray-900',
          'border border-gray-800 dark:border-gray-700',
          'shadow-xl dark:shadow-gray-900/50',
          'text-sm sm:text-base md:text-lg',
          'transition-all duration-200',
          'hover:shadow-2xl hover:border-gray-700 dark:hover:border-gray-600',
          className
        )}
        {...props}
      >
        <code className="font-mono text-gray-100 dark:text-gray-200">
          {children}
        </code>
      </pre>
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
      <p
        className={cn(
          'leading-7 sm:leading-8 md:leading-9 lg:leading-10',
          'text-base sm:text-lg md:text-xl lg:text-2xl',
          'my-6 md:my-8 lg:my-10',
          baseSubTextColor,
          'transition-colors duration-200'
        )}
      >
        {children}
      </p>
    ),

    /** Image */
    img: (props) => (
      <div className="my-8 md:my-10 lg:my-12 flex justify-center">
        <Image
          className={cn(
            'rounded-lg',
            'shadow-md dark:shadow-gray-900/30',
            'transition-transform duration-200',
            'hover:scale-105'
          )}
          alt={props.alt || ''}
          width={props.width || 800}
          height={props.height || 600}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 70vw"
          style={{ width: '100%', height: 'auto' }}
          {...(props as ImageProps)}
        />
      </div>
    ),

    /** Anchor */
    a: ({ href, children, ...props }) => {
      if (!href) return <span {...props}>{children}</span>;

      const isExternal = href.startsWith('http') || href.startsWith('//');
      const LinkComponent = isExternal ? ClientSideLink : Link;

      return (
        <LinkComponent href={href} {...props}>
          <span
            className={cn(
              'underline decoration-dotted underline-offset-4',
              'hover:decoration-solid',
              'text-blue-600 dark:text-blue-400',
              'transition-colors duration-200',
              'hover:text-blue-800 dark:hover:text-blue-300'
            )}
          >
            {children}
          </span>
        </LinkComponent>
      );
    },

    /** Lists */
    ul: ({ children }) => <List ordered={false}>{children}</List>,
    ol: ({ children }) => <List ordered={true}>{children}</List>,
    li: ({ children }) => (
      <li className={cn(baseSubTextColor, 'pl-1 sm:pl-2 md:pl-3')}>
        {children}
      </li>
    ),

    /** Blockquote */
    blockquote: ({ children }) => (
      <blockquote
        className={cn(
          'border-l-4 border-blue-500 dark:border-blue-400',
          'pl-4 sm:pl-6 md:pl-8',
          'my-8 md:my-10 lg:my-12',
          'italic',
          'bg-gray-50 dark:bg-gray-800/30',
          'py-3 sm:py-4 md:py-5',
          'rounded-r-lg',
          'text-gray-700 dark:text-gray-300',
          'transition-colors duration-200'
        )}
      >
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
      <div className="my-8 md:my-10 lg:my-12 w-full overflow-x-auto">
        <table className="w-full border-collapse">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-100 dark:bg-gray-800">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
        {children}
      </tr>
    ),
    th: ({ children }) => <TableCell header>{children}</TableCell>,
    td: ({ children }) => <TableCell>{children}</TableCell>,

    /** Horizontal Rule */
    hr: () => (
      <Separator className="my-8 md:my-10 lg:my-12 dark:border-gray-700" />
    ),

    /** Other Text Formatting */
    strong: ({ children }) => (
      <strong
        className={cn(
          'font-bold',
          'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
          'dark:from-blue-400 dark:via-purple-400 dark:to-pink-400',
          'bg-clip-text text-transparent',
          'px-0.5',
          'transition-all duration-200',
          'hover:from-purple-600 hover:via-pink-600 hover:to-blue-600',
          'dark:hover:from-purple-400 dark:hover:via-pink-400 dark:hover:to-blue-400'
        )}
      >
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
      <figure className="my-6 md:my-8 lg:my-10 text-center">
        {children}
      </figure>
    ),
    figcaption: ({ children }) => (
      <figcaption className="mt-2 text-sm italic text-gray-500 dark:text-gray-400">
        {children}
      </figcaption>
    ),

    /** Gist Integration */
    Gist: ({ url }) => <GistWrapper url={url} className="my-6 md:my-8" />,

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
    Math: ({ children }) => (
      <div className={cn(
        'my-6 md:my-8 lg:my-10',
        'p-4 sm:p-6 md:p-8',
        'overflow-x-auto',
        'bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800',
        'rounded-lg border border-gray-200 dark:border-gray-700',
        'shadow-lg dark:shadow-gray-900/30',
        'transition-all duration-200',
        'hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600'
      )}>
        <Math>{children}</Math>
      </div>
    ),
    ...components,
  };
}
