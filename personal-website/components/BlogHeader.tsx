import { faMedium } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import styles from './BlogHeader.module.scss'
interface Props {
  kicker: string
  title: string
  subTitle: string
  date: string
  mediumUrl: string
  imgSrc: string
  imgAlt: string
  caption: string
}

export default function Header(props: Props) {
  return (
    <Box className={styles.Header}>
      <Typography
        variant="h6"
        component="h3"
        sx={{ fontSize: 'small' }}
        gutterBottom
        className={styles.kicker}
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
      <Box className={styles.info}>
        <Typography variant="body1" className={styles.date}>
          Date Written: {props.date}
        </Typography>
        <Tooltip title="See the post on Medium" arrow>
          <Button
            variant="contained"
            href={props.mediumUrl}
            endIcon={
              <FontAwesomeIcon
                icon={faMedium}
                className={styles.mediumIcon}
                color="#000000"
              />
            }
          />
        </Tooltip>
      </Box>
      <figure className={styles.fig}>
        <Image
          src={props.imgSrc}
          alt={props.imgAlt}
          layout="fill"
          objectFit="scale-down"
          sizes="75vw"
          quality={100}
          className={styles.Image}
        />
        <Typography
          variant="caption"
          component="figcaption"
          className={styles.ImageCaption}
        >
          {props.caption}
        </Typography>
      </figure>
      {/* <Divider className={styles.headerRule} /> */}
    </Box>
  )
}
