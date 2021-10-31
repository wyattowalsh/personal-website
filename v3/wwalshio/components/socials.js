/**React component for personal website landing page destinations section. */
/** Each destination is a link to a page on the website. */

/** Imports  */
import React from "react";
import styles from "./landingdestinations";
import NextLink from 'next/link';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faGithubAlt, faLinkedinIn, faTwitter, faKaggle, faMediumM } from '@fortawesome/free-brands-svg-icons';
import { Typography } from "@material-ui/core";

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
    <Link
        href={item.url} sx={{
            textDecoration: 'none',
        }}
        passHref>
        <Button
           component="a" sx={{
            backgroundColor: 'transparent',
            'color': "primary",
            '&:hover': {
                backgroundColor: 'secondary',
                fontWeight: 'medium',
            },
            p: 4,
            m: 2,
           }} endIcon={item.icon}>
            <Typography variant="body1">{item.name}</Typography>
        </Button>
    </Link>
    )
  });

  return (
    <Stack
    justifyContent="center"
    alignItems="center"
    direction={{ xs: 'column', lg: 'row' }}
    spacing={{ xs: 1, sm: 2, md: 4 }}
  >
      {socials}
      </Stack>
  );
}
