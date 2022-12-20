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
import ProjectType from "../interfaces/project";
import fs from "fs";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import MyCard from "./MyCard";

type project = {
	content: string;
	data: ProjectType;
	filePath: string;
};

type Props = {
	allProjects: project[];
};

export default function Projects({ allProjects }: Props) {
	return (
		<Box className={styles.section}>
			<Typography variant="h2" className={styles.title}>
				Projects
			</Typography>
			<br />
			<Grid container spacing={{ xs: 2, md: 4 }} className={styles.projects}>
				{allProjects.map((proj) => (
					<Grid key={proj.filePath} xs={12} sm={8} md={6} lg={4}>
						<MyCard
							image={proj.data.image}
							title={proj.data.title}
							description={proj.data.description}
							url={proj.data.url}
							slug={proj.data.slug}
						/>
					</Grid>
				))}
			</Grid>
		</Box>
	);
}
