import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import styles from "./BlogHeader.module.scss";

interface Props {
  kicker: string;
  title: string;
  subTitle: string;
}

export default function Header(props: Props) {
  return (
    <Box className={styles.Header}>
      <Typography
        variant="h6"
        component="h3"
        sx={{ fontSize: "small" }}
        gutterBottom
      >
        {props.kicker}
      </Typography>
      <Typography variant="h1" className={styles.title} gutterBottom>
        {props.title}
      </Typography>
      <Typography
        variant="h5"
        component="h2"
        className={styles.subTitle}
        gutterBottom
      >
        {props.subTitle}
      </Typography>
      <Divider />
    </Box>
  );
}
