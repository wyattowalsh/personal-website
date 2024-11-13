// components/MDXComponents.tsx

"use client";

import React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { CodeBlock } from "./CodeBlock";
import TOCInline from '@/components/TOCInline'
import Pre from '@/components/Pre'
import BlogNewsletterForm from '@/components/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'

const Mermaid = dynamic(() => import("./Mermaid"), { ssr: false });

const MDXContext = React.createContext({});

export function useMDXComponents(components?: any) {
	const contextComponents = React.useContext(MDXContext);
	return components
		? { ...contextComponents, ...components }
		: contextComponents;
}

export function MDXProvider({ components, children }: any) {
	const allComponents = useMDXComponents(components);
	return (
		<MDXContext.Provider value={allComponents}>{children}</MDXContext.Provider>
	);
}

export const components: MDXComponents = {
	Image,
	TOCInline,
	a: CustomLink,
	pre: Pre,
	table: TableWrapper,
	BlogNewsletterForm,
	code: CodeBlock,
	Mermaid,
	admonition: ({ type, ...props }: any) => (
		<div className={`admonition ${type}`} {...props} />
	),
};
