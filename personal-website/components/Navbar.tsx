import {
  faGithub,
  faKaggle,
  faLinkedinIn,
  faMedium,
  faSpotify,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons'
import {
  faAddressCard,
  faArrowUpRightFromSquare,
  faBlog,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'
import { Kanban } from 'react-bootstrap-icons'
import Logo from '../public/img/logo.webp'
import styles from './Navbar.module.scss'
import ThemeUpdater from './ThemeUpdater'

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window
}

const drawerWidth = 240

interface LinkTabProps {
  href?: string
  value?: number
  label?: string
  icon?: React.ReactNode
  iconPosition?: string
  className?: string
  onClick?: () => void
}

function LinkTab(props: LinkTabProps) {
  return (
    <Link href={props.href} passHref>
      <Tab onClick={props.onClick} component="a" {...props} />
    </Link>
  )
}

export default function Navbar(props: Props) {
  const { window } = props
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const container =
    window !== undefined ? () => window().document.body : undefined

  const links = (
    <Menu
      id="links-menu"
      MenuListProps={{
        'aria-labelledby': 'links-menu',
      }}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      TransitionComponent={Fade}
      sx={{ zIndex: 5000, marginTop: '1rem' }}
    >
      <MenuItem onClick={handleClose} disableRipple>
        <Link
          href="https://www.linkedin.com/in/wyattowalsh"
          target="_blank"
          rel="noreferrer noopener"
        >
          <FontAwesomeIcon
            icon={faLinkedinIn}
            className={styles.social}
            color="#0A66C2"
          />
          &nbsp; LinkedIn
        </Link>
      </MenuItem>
      <MenuItem onClick={handleClose} disableRipple>
        <Link
          href="https://www.github.com/wyattowalsh"
          target="_blank"
          rel="noreferrer noopener"
        >
          <FontAwesomeIcon
            icon={faGithub}
            className={styles.social}
            color="#181717"
          />
          &nbsp; GitHub
        </Link>
      </MenuItem>
      <MenuItem onClick={handleClose} disableRipple>
        <Link
          href="https://www.kaggle.com/wyattowalsh"
          target="_blank"
          rel="noreferrer noopener"
        >
          <FontAwesomeIcon
            icon={faKaggle}
            className={styles.social}
            color="#20BEFF"
          />
          &nbsp; Kaggle
        </Link>
      </MenuItem>
      <MenuItem onClick={handleClose} disableRipple>
        <Link
          href="https://www.medium.com/@wyattowalsh"
          target="_blank"
          rel="noreferrer noopener"
        >
          <FontAwesomeIcon
            icon={faMedium}
            className={styles.social}
            color="#000000"
          />
          &nbsp; Medium
        </Link>
      </MenuItem>
      <Link
        href="https://www.twitter.com/wyattowalsh"
        target="_blank"
        rel="noreferrer noopener"
      >
        <MenuItem onClick={handleClose} disableRipple>
          <FontAwesomeIcon
            icon={faTwitter}
            className={styles.social}
            color="#1DA1F2"
          />
          &nbsp; Twitter
        </MenuItem>
      </Link>
      <MenuItem onClick={handleClose} disableRipple>
        <Link
          href="https://open.spotify.com/user/122096382?si=98b06ac7098b4774"
          target="_blank"
          rel="noreferrer noopener"
        >
          <FontAwesomeIcon
            icon={faSpotify}
            className={styles.social}
            color="#1DB954"
          />
          &nbsp; Spotify
        </Link>
      </MenuItem>
    </Menu>
  )
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Divider />
      <List>
        <ListItem key="About" disablePadding className={styles.drawerLink}>
          <Link href="/" passHref>
            <ListItemButton>
              <FontAwesomeIcon icon={faAddressCard} className={styles.social} />
              <ListItemText primary="About" />
            </ListItemButton>
          </Link>
        </ListItem>
        <ListItem key="Blog" disablePadding className={styles.drawerLink}>
          <Link href="/blog" passHref>
            <ListItemButton>
              <FontAwesomeIcon icon={faBlog} className={styles.social} />
              <ListItemText primary="Blog" />
            </ListItemButton>
          </Link>
        </ListItem>
        <ListItem key="Projects" disablePadding className={styles.drawerLink}>
          <Link href="/projects" passHref>
            <ListItemButton>
              <Kanban className={styles.social} />
              <ListItemText primary="Projects" />
            </ListItemButton>
          </Link>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem key="LinkedIn" disablePadding className={styles.drawerLink}>
          <Link
            href="https://www.linkedin.com/in/wyattowalsh"
            target="_blank"
            rel="noreferrer noopener"
          >
            <ListItemButton>
              <FontAwesomeIcon
                icon={faLinkedinIn}
                className={styles.social}
                color="#0A66C2"
              />
              <ListItemText primary="LinkedIn" />
            </ListItemButton>
          </Link>
        </ListItem>
        <ListItem key="GitHub" disablePadding className={styles.drawerLink}>
          <Link
            href="https://www.github.com/wyattowalsh"
            target="_blank"
            rel="noreferrer noopener"
          >
            <ListItemButton>
              <FontAwesomeIcon
                icon={faGithub}
                className={styles.social}
                color="#181717"
              />
              <ListItemText primary="GitHub" />
            </ListItemButton>
          </Link>
        </ListItem>
        <ListItem key="Kaggle" disablePadding className={styles.drawerLink}>
          <Link
            href="https://www.kaggle.com/wyattowalsh"
            target="_blank"
            rel="noreferrer noopener"
          >
            <ListItemButton>
              <FontAwesomeIcon
                icon={faKaggle}
                className={styles.social}
                color="#20BEFF"
              />
              <ListItemText primary="Kaggle" />
            </ListItemButton>
          </Link>
        </ListItem>
        <ListItem key="Medium" disablePadding className={styles.drawerLink}>
          <Link
            href="https://www.medium.com/@wyattowalsh"
            target="_blank"
            rel="noreferrer noopener"
          >
            <ListItemButton>
              <FontAwesomeIcon
                icon={faMedium}
                className={styles.social}
                color="#000000"
              />
              <ListItemText primary="Medium" />
            </ListItemButton>
          </Link>
        </ListItem>
        <ListItem key="Twitter" disablePadding className={styles.drawerLink}>
          <Link
            href="https://www.twitter.com/wyattowalsh"
            target="_blank"
            rel="noreferrer noopener"
          >
            <ListItemButton>
              <FontAwesomeIcon
                icon={faTwitter}
                className={styles.social}
                color="#1DA1F2"
              />

              <ListItemText primary="Twitter" />
            </ListItemButton>
          </Link>
        </ListItem>
        <ListItem key="Spotify" disablePadding className={styles.drawerLink}>
          <Link
            href="https://open.spotify.com/user/122096382?si=98b06ac7098b4774"
            target="_blank"
            rel="noreferrer noopener"
          >
            <ListItemButton>
              <FontAwesomeIcon
                icon={faSpotify}
                className={styles.social}
                color="#1DB954"
              />
              <ListItemText primary="Spotify" />
            </ListItemButton>
          </Link>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <AppBar
      enableColorOnDark
      className={styles.Navbar}
      sx={{
        // backgroundColor: 'rgba(181,167,106, 0.65)',
        // backgroundColor: 'rgba(255,255,255,0.85)',
        // backgroundColor: 'rgba(0,0,0,0.1)',
        backgroundColor: 'rgba(181,130,106, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: '10vh',
      }}
    >
      <Toolbar className={styles.toolbar} sx={{ height: '100%' }}>
        <Link href="/">
          <Tooltip title="Return Home" arrow>
            <Box
              className={styles.imageContainer}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              <Image className={styles.image} src={Logo} alt="Site Logo" fill />
            </Box>
          </Tooltip>
        </Link>
        <Link href="/">
          <Tooltip title="Return Home" arrow>
            <Box
              className={styles.imageContainer}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <Image className={styles.image} src={Logo} alt="Site Logo" fill />
            </Box>
          </Tooltip>
        </Link>
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              display: { sm: 'none' },
              width: '1.5rem',
              height: '1.5rem',
            }}
            size="large"
          >
            <MenuIcon />
          </IconButton>
        </Box>
        <Box
          className={styles.navButtons}
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          <Tabs
            value={0}
            aria-label="Site Navigation Tabs"
            textColor="primary"
            variant="fullWidth"
            centered
            className={styles.tabs}
          >
            <LinkTab
              value={0}
              href="/"
              label="About"
              icon={
                <FontAwesomeIcon
                  icon={faAddressCard}
                  className={styles.social}
                />
              }
              iconPosition="end"
              className={styles.tab}
            />
            <LinkTab
              value={1}
              href="/blog"
              label="Blog"
              icon={<FontAwesomeIcon icon={faBlog} className={styles.social} />}
              iconPosition="end"
              className={styles.tab}
            />
            <LinkTab
              value={2}
              href="/projects"
              label="Projects"
              icon={<Kanban size="2rem" />}
              iconPosition="end"
              className={styles.tab}
            />
          </Tabs>
        </Box>
        <Box
          className={styles.right}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          <Box>
            <Button
              id="links-button"
              aria-controls={open ? 'links-button' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              variant="outlined"
              disableElevation
              onClick={handleClick}
              endIcon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />}
              sx={{ color: 'inherit' }}
            >
              Links
            </Button>
            {links}
          </Box>
          <Box>
            <ThemeUpdater />
          </Box>
        </Box>
      </Toolbar>
      <Box>
        <Drawer
          container={container}
          anchor="right"
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </AppBar>
  )
}
