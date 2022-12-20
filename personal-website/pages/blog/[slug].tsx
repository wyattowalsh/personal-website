import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import Box from "@mui/material/Box";
import styles from "./[slug].module.scss";
import Image from "next/image";
import { faMedium } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "@mui/material/Tooltip";
import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { blogFilePaths, BLOG_PATH } from "../../utils/mdxUtils";
import Post from "../../interfaces/post";

type Props = {
	source: MDXRemoteSerializeResult;
	frontMatter: Post;
};

export default function BlogPage({ source, frontMatter }: Props) {
	return (
		<>
			<Nav />
			<main className={styles.main}>
				<Box sx={{ maxWidth: "70%" }}>
					<h1>
						{frontMatter.title} &nbsp;
						<a href={frontMatter.url} target="_blank" rel="noopener noreferrer">
							<Tooltip title="See the post on Medium" arrow>
								<a href={frontMatter.url} target="_blank" rel="noreferrer">
									<FontAwesomeIcon
										icon={faMedium}
										className={styles.social}
										color="#000000"
									/>
								</a>
							</Tooltip>
						</a>
					</h1>
					<Box sx={{ overflow: "hidden" }}>
						<Image
							src={frontMatter.image}
							alt={frontMatter.title}
							sizes="(min-width: 768px) 80px, 60px"
							layout="responsive"
							width={350}
							height={350}
						/>
					</Box>
					<MDXRemote {...source} />
				</Box>
			</main>
			<Footer />
		</>
	);
}

export const getStaticProps = async ({ params }) => {
	const blogFilePath = path.join(BLOG_PATH, `${params.slug}.mdx`);
	const source = fs.readFileSync(blogFilePath);

	const { content, data } = matter(source);

	const mdxSource = await serialize(content, {
		// Optionally pass remark/rehype plugins
		mdxOptions: {
			remarkPlugins: [],
			rehypePlugins: [],
		},
		scope: data,
	});

	return {
		props: {
			source: mdxSource,
			frontMatter: data,
		},
	};
};

export const getStaticPaths = async () => {
	const paths = blogFilePaths
		// Remove file extensions for page paths
		.map((path) => path.replace(/\.mdx?$/, ""))
		// Map the path into the static paths object required by Next.js
		.map((slug) => ({ params: { slug } }));

	return {
		paths,
		fallback: false,
	};
};
