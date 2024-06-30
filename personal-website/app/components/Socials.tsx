// components/Socials.tsx

import {
  faCodepen,
  faGithub,
  faKaggle,
  faLinkedin,
  faMedium,
  faSpotify,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope as faEnvelopeSolid } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Anchor, Flex, Group, Title } from '@mantine/core';
import styles from './Socials.module.scss';

const links = [
  {
    name: 'GitHub',
    url: 'https://www.github.com/wyattowalsh',
    icon: faGithub,
    color: '#181717',
    bgcolor: '#ffffff',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/wyattowalsh',
    icon: faLinkedin,
    color: '#0A66C2',
    bgcolor: '#c2500a',
  },
  {
    name: 'X',
    url: 'https://www.x.com/wyattowalsh',
    icon: faXTwitter,
    color: '#000000',
    bgcolor: '#ffffff',
  },
  {
    name: 'Medium',
    url: 'https://www.medium.com/@wyattowalsh',
    icon: faMedium,
    color: '#000000',
    bgcolor: '#ffffff',
  },
  {
    name: 'Kaggle',
    url: 'https://www.kaggle.com/wyattowalsh',
    icon: faKaggle,
    color: '#20BEFF',
    bgcolor: '#ff6720',
  },
  {
    name: 'Spotify',
    url: 'https://www.spotify.com/wyattowalsh',
    icon: faSpotify,
    color: '#1DB954',
    bgcolor: '#b92a1d',
  },
  {
    name: 'CodePen',
    url: 'https://codepen.io/wyattowalsh',
    icon: faCodepen,
    color: '#000000',
    bgcolor: '#ffffff',
  },
  {
    name: 'Email',
    url: 'mailto:wyattowalsh@gmail.com',
    icon: faEnvelopeSolid,
    color: '#b5a76a',
    bgcolor: '#996ab5',
  },
]

interface Link {
  name: string;
  url: string;
  icon: any;
  color: string;
  bgcolor: string;
}

export function Social({ link }: { link: Link }) {
  return (
    <Anchor href={link.url} target="_blank" rel="noopener noreferrer" className={styles.social}>
        <Group className={styles.socialLink} align="center" justify="space-around" miw={{base:"80vw", lg:'70vw', xl:'40vw' }} h='6vh' px={{ base: 'sm', sm: 'md', md: 'lg' }} color={link.color} 
               style={{ transition: 'all 0.2s ease' }} >
            <FontAwesomeIcon icon={link.icon} className={styles.socialIcon} color={link.color} flip beat fade style={{'--fa-animation-duration': '10s', "--fa-flip-angle": "180deg"}} r0tation={180}/>
            <Title order={3} className={styles.socialText} c='black'>{link.name}</Title>
            <FontAwesomeIcon icon={link.icon} className={styles.socialIcon} color={link.color} flip beat fade style={{"--fa-animation-duration": "10s", "--fa-flip-angle": "180deg"}} />
        </Group>
    </Anchor>
  );
}

// Socials component using the link info
export function Socials() {
  return (
    <Flex direction="column" align="center" justify="flex-start" gap={{ base: 'sm', sm: 'md', md: 'lg' }} className={styles.socials}>
      {links.map((link) => (
        <Social key={link.name} link={link} />
      ))}
    </Flex>
  );
}