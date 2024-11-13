'use client';

import Image from "next/image";
import dynamic from "next/dynamic";
import { CodeBlock } from "./CodeBlock";

const Mermaid = dynamic(() => import("./Mermaid"), { ssr: false });

export const components = {
	img: (props) => <Image {...props} alt={props.alt} />,
	code: CodeBlock,
	mermaid: Mermaid,
	admonition: (props) => (
		<div className={`admonition ${props.type}`} {...props} />
	),
};
