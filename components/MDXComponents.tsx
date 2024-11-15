// components/MDXComponents.tsx

import Image from "next/image";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { CodeBlock } from "@/components/CodeBlock";

const MDXComponents = {
	h1: (props) => <h1 className="text-4xl font-bold my-4" {...props} />,
	h2: (props) => <h2 className="text-3xl font-bold my-3" {...props} />,
	h3: (props) => <h3 className="text-2xl font-semibold my-2" {...props} />,
	p: (props) => <p className="mb-4 text-lg leading-relaxed" {...props} />,
	a: (props) => <Link className="text-blue-600 hover:underline" {...props} />,
	ul: (props) => <ul className="list-disc ml-6 mb-4" {...props} />,
	ol: (props) => <ol className="list-decimal ml-6 mb-4" {...props} />,
	li: (props) => <li className="mb-2" {...props} />,
	img: (props) => (
		<Image
			{...props}
			alt={props.alt || ""}
			width={800}
			height={400}
			style={{ width: "100%", height: "auto" }}
		/>
	),
	pre: (props) => (
		<pre
			className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto"
			{...props}
		/>
	),
	code: CodeBlock,
	Alert,
};

export default MDXComponents;
