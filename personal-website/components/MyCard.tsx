import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "@mui/material/Tooltip";
import styles from "./MyCard.module.scss";

type Props = {
	image: string;
	title: string;
	description: string;
	url: string;
	slug: string;
};

export default function MyCard({
	image,
	title,
	description,
	url,
	slug,
}: Props) {
	return (
		<Card sx={{ maxWidth: 345 }}>
			<CardMedia component="img" height="140" image={image} alt={title} />
			<CardContent>
				<Typography gutterBottom variant="h5" component="div">
					{title}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{description}
				</Typography>
			</CardContent>
			<CardActions
				sx={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
					marginRight: "1rem",
				}}
			>
				<Button size="large">Read More</Button>
				<Tooltip title="View the Project on GitHub" arrow>
					<a href={url} target="_blank" rel="noreferrer">
						<FontAwesomeIcon
							icon={faGithub}
							className={styles.social}
							color="#181717"
						/>
					</a>
				</Tooltip>
			</CardActions>
		</Card>
	);
}
