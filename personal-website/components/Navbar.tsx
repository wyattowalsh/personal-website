import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'
import Logo from '../public/img/logo.webp'
import styles from './Navbar.module.scss'

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window
  darkMode?: () => void
  setDarkMode?: () => void
}

const drawerWidth = 240

export default function Navbar(props: Props) {
  const { window } = props
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}></Typography>
      <Divider />
      <List>
        <ListItem key="Home" disablePadding>
          <ListItemButton sx={{ textAlign: 'center' }}>
            <Link href="/" passHref>
              <ListItemText primary="Home" />
            </Link>
          </ListItemButton>
        </ListItem>
        <ListItem key="Blog" disablePadding>
          <ListItemButton sx={{ textAlign: 'center' }}>
            <Link href="/blog" passHref>
              <ListItemText primary="Blog" />
            </Link>
          </ListItemButton>
        </ListItem>
        <ListItem key="Projects" disablePadding>
          <ListItemButton sx={{ textAlign: 'center' }}>
            <Link href="/projects" passHref>
              <ListItemText primary="Projects" />
            </Link>
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  const container =
    window !== undefined ? () => window().document.body : undefined

  return (
    <AppBar
      component="nav"
      className={styles.Navbar}
      sx={{
        backgroundColor: 'rgba(255,255,255,0.65)',
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
        <Tooltip title="Return Home" arrow>
          <Link href="/">
            <Box
              className={styles.imageContainer}
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              <Image className={styles.image} src={Logo} alt="Site Logo" fill />
            </Box>
          </Link>
        </Tooltip>
        <Tooltip title="Return Home" arrow>
          <Link href="/">
            <Box
              className={styles.imageContainer}
              sx={{ display: { xs: 'block', sm: 'none' } }}
            >
              <Image className={styles.image} src={Logo} alt="Site Logo" fill />
            </Box>
          </Link>
        </Tooltip>
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, flexGrow: 1, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        <Box
          className={styles.navButtons}
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          <ButtonGroup
            size="large"
            aria-label="Site Navigation Buttons"
            fullWidth
          >
            <Link href="/" passHref>
              <Button className={styles.button} selected={true}>
                About
              </Button>
            </Link>
            <Link href="/blog" passHref>
              <Button className={styles.button} selected={true}>
                Blog
              </Button>
            </Link>
            <Link href="/projects" passHref>
              <Button className={styles.button} selected={true}>
                Projects
              </Button>
            </Link>
          </ButtonGroup>
        </Box>
        <Box
          className={styles.right}
          sx={{ display: { xs: 'none', sm: 'block' } }}
        ></Box>
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
