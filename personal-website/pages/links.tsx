/* linktree page
*/
// -- Imports ------------------------------------------------------------------
import {
    faCodepen,
    faGithub,
    faKaggle,
    faLinkedinIn,
    faMedium,
    faSpotify,
    faTwitter
} from "@fortawesome/free-brands-svg-icons";
import {
    faEnvelope,
    faFileAlt
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Head from "next/head";
import Image from "next/image";
import Logo from "../public/img/profile-pic-square.webp";
import styles from "./links.module.scss";

// -- Data ---------------------------------------------------------------------
const links = [
    {
        name: "Email",
        url: "mailto:wyattowalsh@gmail.com",
        icon: faEnvelope,
        color: "#6a9fb5"
    },
    {
        name: "Resume",
        url: "/resume.pdf",
        icon: faFileAlt,
        color: "#6a9fb5"
    },
    {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/wyattowalsh",
        icon: faLinkedinIn,
        color: "#0A66C2"
    },
    {
        name: "GitHub",
        url: "https://www.github.com/wyattowalsh",
        icon: faGithub,
        color: "#181717"
    },
    {
        name: "Twitter",
        url: "https://www.twitter.com/wyattowalsh",
        icon: faTwitter,
        color: "#1DA1F2"
    },
    {
        name: "Medium",
        url: "https://www.medium.com/@wyattowalsh",
        icon: faMedium,
        color: "#000000"
    },
    {
        name: "Kaggle",
        url: "https://www.kaggle.com/wyattowalsh",
        icon: faKaggle,
        color: "#20BEFF"
    },
    {
        name: "CodePen",
        url: "https://www.codepen.io/wyattowalsh",
        icon: faCodepen,
        color: "#000000"
    },
    {
        name: "Spotify",
        url: "https://open.spotify.com/user/122096382?si=7aa4f43249af4e45",
        icon: faSpotify,
        color: "#1DB954"
    },
];


export default function LinkTree() {
    return (
        <Box className={styles.container}>
            <Head>
                <title>Wyatt Walsh&apos;s Links</title>
                <meta name="description" content="Wyatt Walsh's links to online profiles" />
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="icon" href="/favicon/favicon.ico" />
            </Head>
            <Box className={styles.header}>
                <Typography variant="h1" component="h1" className={styles.name}>
                    Wyatt Walsh&apos;s Links
                </Typography>
                <Box className={styles.avatar}>
                    <Image
                        src={Logo}
                        alt="Wyatt Walsh"
                        quality={100}
                        sizes="(max-width: 600px) 65vw,
                                (max-width: 900px) 50vw,
                                (max-width: 1200px) 45vw,
                                (max-width: 1536px) 40vw,
                                65vw"
                        fill
                    />
                </Box>
            </Box>
            <Box className={styles.links}>
                {links.map((link) => (
                    <Link href={link.url} key={link.name} underline="hover" target="_blank" rel="noreferrer">
                        <Tooltip title={link.name} placement="bottom" arrow>
                            <Box className={styles.link}>
                                <FontAwesomeIcon className={styles.icon} icon={link.icon} size="4x" color={link.color} />
                                <Typography variant="h2" component="h2" className={styles.linkName}>{link.name}</Typography>
                            </Box>
                        </Tooltip>
                    </Link>
                ))}
            </Box>
        </Box>
    );
}