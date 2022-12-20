import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import styles from "./Projects.module.scss";
import Image from "next/image";
import Grid from "@mui/material/Unstable_Grid2";
import Link from "next/link";
import { projectFilePaths, PROJECTS_PATH } from "../utils/mdxUtils";
import matter from "gray-matter";
import path from "path";
import PostType from "../interfaces/post";
import fs from "fs";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import MyCard from "./MyCard";

type post = {
	content: string;
	data: PostType;
	filePath: string;
};

type Props = {
	allPosts: post[];
};

export default function Blog({ allPosts }: Props) {
	return (
		<Box className={styles.section}>
			<Typography variant="h2" className={styles.title}>
				Blog
			</Typography>
			<br />
			<Grid container spacing={{ xs: 2, md: 4 }} className={styles.projects}>
				{allPosts.map((post) => (
					<Grid key={post.filePath} xs={12} sm={8} md={6} lg={4}>
						<MyCard
							image={post.data.image}
							title={post.data.title}
							description={post.data.description}
							url={post.data.url}
							slug={post.data.slug}
						/>
					</Grid>
				))}
			</Grid>
		</Box>
	);
}
