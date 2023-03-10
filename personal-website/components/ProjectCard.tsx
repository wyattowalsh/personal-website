import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import styles from './ProjectCard.module.scss'

export default function ProjectCard({
  slug,
  title,
  description,
  date,
  url,
  image,
}: Project.data) {
  return (
    <Card sx={{ maxWidth: 345 }} className={styles.card}>
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
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginRight: '1rem',
        }}
      >
        <Link href={`/projects/${slug}`}>
          <Button size="large">Read More</Button>
        </Link>
        <Tooltip title="View the Project on GitHub" arrow>
          <Link href={url} target="_blank" rel="noreferrer">
            <FontAwesomeIcon
              icon={faGithub}
              className={styles.social}
              color="#181717"
            />
          </Link>
        </Tooltip>
      </CardActions>
    </Card>
  )
}
