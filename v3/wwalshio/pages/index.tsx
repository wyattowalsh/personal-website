import * as React from 'react';
import NextLink from 'next/link';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import Landing from "../components/landing";
import { Typography } from '@material-ui/core';
import LandingDestinations from '../components/landingdestinations';
import Socials from "../components/socials"
export default function Index() {
  return ( 
    <Container  component="div" maxWidth="md" Height="100%" sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      m: "auto"
    }}>
      <Container maxWidth="85%" maxHeight= "85%" component="div">
        <br />
        <Typography variant="h2" component="div"><b>Hi There</b><span role="img" aria-label="wave">👋</span></Typography >
        <br />
        <Typography variant="h3" component="div" align="right">Welcome to my site!</Typography>
        <br />
        <LandingDestinations />
        <br />
        <Socials />
      </Container>, 
      <br />
    </Container>
  );
}