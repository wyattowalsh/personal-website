import * as React from "react";
import Grid from "@mui/material/Grid";
import Landing from "../components/landing";
import LandingDestinations from "../components/landingdestinations";
import Socials from "../components/socials";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import styles from "./index.module.scss";

export default function Index() {
  return (
    <Grid>
      <Landing />
      <div className={styles.landingBase}>
        <Container
          maxWidth="lg"
          sx={{ mt: { xs: 2, sm: 8 }, mb: { xs: -14, sm: -14 } }}
        >
          <br />
          <br />
          <Typography
            variant="h2"
            align="left"
            color="#ffffff"
            sx={{
              ml: { xs: 2, md: 4, lg: 8 },
              zIndex: 2,
              backgroundColor: "transparent",
            }}
          >
            <b>Hi There</b>
            <span role="img" aria-label="wave">
              👋
            </span>
          </Typography>
          <br />
          <Typography
            variant="h4"
            align="right"
            color="#ffffff"
            sx={{
              mr: { xs: 2, md: 4, lg: 8 },
              zIndex: 2,
              backgroundColor: "transparent",
            }}
          >
            Welcome to my site!
          </Typography>
        </Container>
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ minHeight: "100vh" }}
        >
          <Grid item xs={12}>
            <br />
            <Grid
              item
              xs={12}
              width="100%"
              style={{ textAlign: "center" }}
              alignItems="center"
              justifyContent="center"
            >
              <LandingDestinations />
            </Grid>
            <br />
            <br />
            <br />
            <Grid
              item
              xs={12}
              width="100%"
              style={{ textAlign: "center" }}
              alignItems="center"
              justifyContent="center"
            >
              <Socials />
            </Grid>
          </Grid>
        </Grid>
      </div>
    </Grid>
  );
}
