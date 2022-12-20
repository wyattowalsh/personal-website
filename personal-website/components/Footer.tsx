import * as React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import styles from "./Footer.module.scss";
import Image from "next/image";
import Logo from "../public/img/logo.webp";
import {
	faLinkedinIn,
	faGithub,
	faKaggle,
	faMedium,
	faTwitter,
	faSpotify,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function About() {
	return (
		<Box className={styles.box}>
			<Box className={styles.avatar}>
				<Image src={Logo} alt="Personal Avatar" width={40} />
			</Box>
			<hr className={styles.rule} />
			<Box
				className={styles.socials}
				sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" } }}
			>
				<Tooltip title="LinkedIn" arrow>
					<a
						href="https://www.linkedin.com/in/wyattowalsh"
						target="_blank"
						rel="noreferrer"
					>
						<FontAwesomeIcon
							icon={faLinkedinIn}
							className={styles.social}
							color="#0A66C2"
						/>
					</a>
				</Tooltip>
				<Tooltip title="GitHub" arrow>
					<a
						href="https://www.github.com/wyattowalsh"
						target="_blank"
						rel="noreferrer"
					>
						<FontAwesomeIcon
							icon={faGithub}
							className={styles.social}
							color="#181717"
						/>
					</a>
				</Tooltip>
				<Tooltip title="Kaggle" arrow>
					<a
						href="https://www.kaggle.com/wyattowalsh"
						target="_blank"
						rel="noreferrer"
					>
						<FontAwesomeIcon
							icon={faKaggle}
							className={styles.social}
							color="#20BEFF"
						/>
					</a>
				</Tooltip>
				<Tooltip title="Medium" arrow>
					<a
						href="https://www.medium.com/@wyattowalsh"
						target="_blank"
						rel="noreferrer"
					>
						<FontAwesomeIcon
							icon={faMedium}
							className={styles.social}
							color="#000000"
						/>
					</a>
				</Tooltip>
				<Tooltip title="Twitter" arrow>
					<a
						href="https://www.twitter.com/wyattowalsh"
						target="_blank"
						rel="noreferrer"
					>
						<FontAwesomeIcon
							icon={faTwitter}
							className={styles.social}
							color="#1DA1F2"
						/>
					</a>
				</Tooltip>
				<Tooltip title="Spotify" arrow>
					<a
						href="https://open.spotify.com/user/122096382?si=98b06ac7098b4774"
						target="_blank"
						rel="noreferrer"
					>
						<FontAwesomeIcon
							icon={faSpotify}
							className={styles.social}
							color="#1DB954"
						/>
					</a>
				</Tooltip>
			</Box>
		</Box>
	);
}
