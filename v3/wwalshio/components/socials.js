/**React component for personal website landing page destinations section. */
/** Each destination is a link to a page on the website. */

/** Imports  */
import React from "react";
import styles from "./landingdestinations";
import { styled } from '@mui/material/styles';
import NextLink from 'next/link';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faGithubAlt, faLinkedinIn, faTwitter, faKaggle, faMediumM } from '@fortawesome/free-brands-svg-icons';
import { Typography } from "@material-ui/core";
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';


export default function Socials() {


  const socials_data= [{
      name: "GitHub",
      url: "https://github.com/wyattowalsh",
      description: "My GitHub profile URL",
      icon: < FontAwesomeIcon icon = {
        ['fab', 'github-alt']
      }
      />,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/wyattowalsh/",
      description: "My LinkedIn profile URL",
      icon: < FontAwesomeIcon icon = {
        ['fab', 'linkedin-in']
      }
      />,
    },
    {
      name: "Medium",
      url: "https://medium.com/@wyattowalsh",
      description: "My personal Medium blog URL",
      icon: < FontAwesomeIcon icon = {
        ['fab', 'medium-m']
      }
      />,
    },
    {
      name: "Twitter",
      url: "https://twitter.com/wyattowalsh",
      description: "My personal Twitter feed URL",
      icon:< FontAwesomeIcon icon = {
        ['fab', 'twitter']
      }
      />,
    },
    {
      name: "Kaggle",
      url: "https://www.kaggle.com/wyattowalsh",
      description: "My personal Kaggle profile URL",
      icon:< FontAwesomeIcon icon = {
        ['fab', 'kaggle']
      }
      />,
    },
    {
      name: "Spotify",
      url: "https://open.spotify.com/user/122096382?si=773364699d0045eb",
      description: "My personal Spotify profile URL",
      icon:< FontAwesomeIcon icon = {
        ['fab', 'spotify']
      }
      />,
    }
  ]

  const socials = [];
  socials_data.forEach(function (item, index) {
    socials.push(
      <NextLink href={item.url} passHref>
        <Grid item xs={4}><Button endIcon={item.icon} sx={{textAlign: 'center',
  color: "primary",
  fontSize: {xs:'0.5rem', md:'0.8rem'},
  px: {xs: 2, md: 4},
  py: {xs: 2, md: 4},
  backgroundColor: "rgb(233, 30, 99, 0.25)",
  '&:hover': {
    color: "secondary",
    backgroundColor: "rgb(233, 30, 99, 0.85)"
}}}>{item.name}</Button></Grid>
      </NextLink>
    )
  });

  return (
    <Grid container spacing={4}
    direction={{xs: "row"}}
    alignItems="center"
    justifyContent="center">
        {socials}
      </Grid>
  );
}
