import Nav from "../Nav";
import Footer from "../Footer";
import Box from "@mui/material/Box";
import styles from "./ProjectLayout.module.scss";
import Image from "next/image";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "@mui/material/Tooltip";

export default function Layout({ meta, children }) {
	return (
		<>
			<Nav />
			<main className={styles.main}>
				<Box sx={{ maxWidth: "70%" }}>
					<h1>
						{meta.title} &nbsp;
						<a href={meta.url} target="_blank" rel="noopener noreferrer">
							<Tooltip title="Visit the Project on GitHub" arrow>
								<FontAwesomeIcon icon={faGithub} />
							</Tooltip>
						</a>
					</h1>
					<Box sx={{ overflow: "hidden" }}>
						<Image
							src={meta.image}
							sizes="(min-width: 768px) 80px, 60px"
							layout="responsive"
							width={350}
							height={350}
						/>
					</Box>
					{children}
				</Box>
			</main>
			<Footer />
		</>
	);
}
