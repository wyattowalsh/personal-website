import Head from "next/head";
import Image from "next/image";
import CssBaseline from "@mui/material/CssBaseline";
import styles from "../styles/Home.module.css";
import Nav from "../components/Nav";
import Landing from "../components/Landing";
import About from "../components/About";
import Footer from "../components/Footer";
import { Element } from "react-scroll";
import Projects from "../components/Projects";
import Blog from "../components/Blog";
import {
	projectFilePaths,
	PROJECTS_PATH,
	blogFilePaths,
	BLOG_PATH,
} from "../utils/mdxUtils";
import path from "path";
import Project from "../interfaces/project";
import Post from "../interfaces/project";
import fs from "fs";
import matter from "gray-matter";
import Logo from "/img/logo.webp";

type project = {
	content: string;
	data: Project;
	filePath: string;
};

type post = {
	content: string;
	data: Post;
	filePath: string;
};

type Props = {
	allProjects: project[];
	allPosts: post[];
};

export default function Home({ allProjects, allPosts }: Props) {
	return (
		<div className={styles.container}>
			<Head>
				<title>Wyatt Walsh's Personal Website | Home</title>
				<meta
					name="description"
					content="Welcome to my personal website, which hosts my projects, blog, and notes."
				/>
				<link rel="icon" href="/favicon/favicon.ico" />
				<meta
					property="og:description"
					content="Welcome to my personal website, which hosts my projects, blog, and notes."
				/>
				<meta property="og:image" content={Logo} />
			</Head>

			<main className={styles.main}>
				<CssBaseline />
				<Nav />
				<Landing />
				<hr className={styles.hr} />
				<Element name="About" className="element">
					<About />
				</Element>
				<hr className={styles.hr} />
				<Element name="Projects" className="element">
					<Projects allProjects={allProjects} />
				</Element>
				<hr className={styles.hr} />
				<Element name="Blog" className="element">
					<Blog allPosts={allPosts} />
				</Element>
			</main>

			<Footer />
		</div>
	);
}

export function getStaticProps() {
	const allProjects = projectFilePaths.map((filePath) => {
		const source = fs.readFileSync(path.join(PROJECTS_PATH, filePath));
		const { content, data } = matter(source);

		return {
			content,
			data,
			filePath,
		};
	});
	const allPosts = blogFilePaths.map((filePath) => {
		const source = fs.readFileSync(path.join(BLOG_PATH, filePath));
		const { content, data } = matter(source);

		return {
			content,
			data,
			filePath,
		};
	});

	return { props: { allProjects, allPosts } };
}
