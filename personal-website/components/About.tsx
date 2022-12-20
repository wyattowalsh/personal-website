import * as React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import styles from "./About.module.scss";
import Image from "next/image";
import Avatar from "../public/img/avatar.webp";
import Button from "@mui/material/Button";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

export default function About() {
	return (
		<Box
			className={styles.box}
			sx={{
				flexDirection: { xs: "column", sm: "row" },
			}}
		>
			<Box className={styles.avatar}>
				<Image src={Avatar} alt="Personal Avatar" width={250} />
			</Box>
			<Box className={styles.about}>
				<Typography variant="body1">
					I usually like to work with data science, machine learning,
					optimization / mathematical programming, or similar fields. However, I
					am boundless in my curiosity when it comes to computers, mathematics,
					and computer science, which has given me experience across many
					technological landscapes.
				</Typography>
				<br />
				<Tooltip title="Download a .PDF copy of my current resume" arrow>
					<a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
						<Button variant="contained" endIcon={<FileDownloadIcon />}>
							Download Resume
						</Button>
					</a>
				</Tooltip>
			</Box>
		</Box>
	);
}
