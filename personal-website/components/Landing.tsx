import * as React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import styles from "./Landing.module.scss";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import {
	faLinkedinIn,
	faGithub,
	faKaggle,
	faMedium,
	faTwitter,
	faSpotify,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Scroll from "react-scroll";
const Link = Scroll.Link;

export default function Landing() {
	return (
		<Box className={styles.box}>
			<Typography variant="h1" className={styles.landing}>
				<Box className={styles.greeting}>
					<span>
						Hey! <span className={styles.wave}>👋</span>
					</span>
				</Box>
				<blockquote className={styles.introBQ}>
					<span className={styles.intro}> My name is </span>
					<span className={styles.name}>Wyatt</span>
				</blockquote>
			</Typography>
			<Typography
				variant="h4"
				className={styles.desc}
				sx={{ fontSize: { xs: "1.15rem", md: "1.35rem" } }}
			>
				I am a Developer, Entrepreneur, and Engineer
			</Typography>
			<Typography
				variant="h5"
				className={styles.welcome}
				sx={{ fontSize: { xs: "1.35rem", md: "2rem" } }}
			>
				Welcome to my personal website!
			</Typography>
			<Box
				className={styles.socials}
				sx={{ fontSize: { xs: "2.25rem", md: "2.8rem" } }}
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
			<Link to={"About"} spy={true} smooth={true} duration={500}>
				<Tooltip title="Scroll Down" arrow>
					<FontAwesomeIcon icon={faCaretDown} className={styles.caret} bounce />
				</Tooltip>
			</Link>
		</Box>
	);
}
