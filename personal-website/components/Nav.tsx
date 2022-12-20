import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Image from "next/image";
import Logo from "../public/img/logo.png";
import Scroll from "react-scroll";
const Link = Scroll.Link;
import NextLink from "next/link";

interface Props {
	/**
	 * Injected by the documentation to work in an iframe.
	 * You won't need it on your project.
	 */
	window?: () => Window;
}

const drawerWidth = 240;
const navItems = ["About", "Projects", "Blog"];

export default function Nav(props: Props) {
	const { window } = props;
	const [mobileOpen, setMobileOpen] = React.useState(false);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const drawer = (
		<Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
			<Typography variant="h6" sx={{ my: 2 }}></Typography>
			<Divider />
			<List>
				{navItems.map((item) => (
					<ListItem key={item} disablePadding>
						<ListItemButton sx={{ textAlign: "center" }}>
							<Link to={item} spy={true} smooth={true} duration={500}>
								<ListItemText primary={item} />
							</Link>
						</ListItemButton>
					</ListItem>
				))}
				<ListItem key="Notes Vault" disablePadding>
					<ListItemButton sx={{ textAlign: "center" }}>
						<a href="https://www.w4w.dev/notes">
							<ListItemText primary="Notes Vault" />
						</a>
					</ListItemButton>
				</ListItem>
			</List>
		</Box>
	);

	const container =
		window !== undefined ? () => window().document.body : undefined;

	return (
		<Box sx={{ display: "flex", height: "8vh" }}>
			<AppBar component="nav">
				<Toolbar
					sx={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
					}}
				>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						edge="start"
						onClick={handleDrawerToggle}
						sx={{ mr: 2, display: { sm: "none" } }}
					>
						<MenuIcon />
					</IconButton>
					<Typography
						variant="h5"
						component="div"
						sx={{
							flexGrow: 1,
							display: { xs: "none", sm: "flex" },
							flexDirection: "row",
							alignItems: "center",
						}}
					>
						<NextLink href="/">
							<Box mt={1.25}>
								<Image src={Logo} alt="Site Logo" width={40} height={40} />
							</Box>
						</NextLink>
					</Typography>
					<Box sx={{ display: { xs: "none", sm: "block" } }}>
						{navItems.map((item) => (
							<Button key={item} sx={{ color: "#fff" }}>
								<Link to={item} spy={true} smooth={true} duration={500}>
									{item}
								</Link>
							</Button>
						))}
						<Button key="Notes Vault" sx={{ color: "#fff" }}>
							<a href="./notes">Notes Vault</a>
						</Button>
					</Box>
					<Box mt={1.25} sx={{ display: { xs: "block", sm: "none" } }}>
						<Image src={Logo} alt="Site Logo" width={40} height={40} />
					</Box>
				</Toolbar>
			</AppBar>
			<Box component="nav">
				<Drawer
					container={container}
					variant="temporary"
					open={mobileOpen}
					onClose={handleDrawerToggle}
					ModalProps={{
						keepMounted: true, // Better open performance on mobile.
					}}
					sx={{
						display: { xs: "block", sm: "none" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: drawerWidth,
						},
					}}
				>
					{drawer}
				</Drawer>
			</Box>
		</Box>
	);
}
