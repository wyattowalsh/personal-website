import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import styles from "./Hero.module.scss";

interface Props {
  imgSrc: string;
  imgAlt: string;
  caption: string;
}

export default function Hero(props: Props) {
  return (
    <Box>
      <figure className={styles.ImageContainer}>
        <Box className={styles.Image}>
          <Image
            src={props.imgSrc}
            alt={props.imgAlt}
            layout="responsive"
            width="100"
            height="100"
          />
        </Box>
        <Typography
          variant="caption"
          component="figcaption"
          className={styles.ImageCaption}
        >
          {props.caption}
        </Typography>
      </figure>
      <Divider />
    </Box>
  );
}
