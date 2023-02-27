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
  faTwitter,
} from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faFileAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import Particles from 'react-particles'
import styles from 'styles/scss/pages/links.module.scss'
import { loadFull } from 'tsparticles'
import type { Engine } from 'tsparticles-engine'
import { ISourceOptions } from 'tsparticles-engine'
import Layout from '../components/layouts/links'
import Logo from '../public/img/profile-pic-square.webp'
import particlesOptions from '../utils/particles.json'
// -- Data ---------------------------------------------------------------------
const links = [
  {
    name: 'Email',
    url: 'mailto:wyattowalsh@gmail.com',
    icon: faEnvelope,
    color: 'black',
  },
  {
    name: 'Resume',
    url: '/resume.pdf',
    icon: faFileAlt,
    color: 'black',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/wyattowalsh',
    icon: faLinkedinIn,
    color: '#0A66C2',
  },
  {
    name: 'GitHub',
    url: 'https://www.github.com/wyattowalsh',
    icon: faGithub,
    color: '#181717',
  },
  {
    name: 'Twitter',
    url: 'https://www.twitter.com/wyattowalsh',
    icon: faTwitter,
    color: '#1DA1F2',
  },
  {
    name: 'Medium',
    url: 'https://www.medium.com/@wyattowalsh',
    icon: faMedium,
    color: '#000000',
  },
  {
    name: 'Kaggle',
    url: 'https://www.kaggle.com/wyattowalsh',
    icon: faKaggle,
    color: '#20BEFF',
  },
  {
    name: 'CodePen',
    url: 'https://www.codepen.io/wyattowalsh',
    icon: faCodepen,
    color: '#000000',
  },
  {
    name: 'Spotify',
    url: 'https://open.spotify.com/user/122096382?si=7aa4f43249af4e45',
    icon: faSpotify,
    color: '#1DB954',
  },
]

export default function LinkTree() {
  const particlesInit = async (main: Engine) => {
    // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(main)
  }
  return (
    <Box className={styles.container}>
      <Particles
        className={styles.particles}
        options={particlesOptions as ISourceOptions}
        init={particlesInit}
      />
      <Box className={styles.header}>
        <Box className={styles.avatar}>
          <Image
            src={Logo}
            alt="Wyatt Walsh"
            layout="responsive"
            width="100"
            height="100"
          />
        </Box>
        <Typography variant="h1" className={styles.name}>
          Wyatt Walsh&apos;s Links
        </Typography>
      </Box>
      <Box className={styles.links}>
        {links.map((link) => (
          <Link
            href={link.url}
            key={link.name}
            underline="hover"
            target="_blank"
            rel="noreferrer"
          >
            <Tooltip title={link.name} placement="bottom" arrow>
              <Box className={styles.link}>
                <FontAwesomeIcon
                  className={styles.icon}
                  icon={link.icon}
                  size="4x"
                  color={link.color}
                />
                <Typography className={styles.linkName}>{link.name}</Typography>
              </Box>
            </Tooltip>
          </Link>
        ))}
      </Box>
    </Box>
  )
}

LinkTree.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}
