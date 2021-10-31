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
import {faFolderOpen} from '@fortawesome/free-solid-svg-icons';
import { Typography } from "@material-ui/core";

export default function LandingDestinations() {


  const siteMap = [{
      name: "Interests",
      url: "/interests",
      description: "A collection of my interests and hobbies.",
      icon: <span role = "img" aria-label = "hmm" > 🤔 </span>,
      image: "/static/images/interests.jpg"
    },
    {
      name: "Projects",
      url: "/projects",
      description: "A collection of my projects.",
      icon: < FontAwesomeIcon icon = {
        ['far', 'folder-open']
      }
      />,
      image: "/static/images/projects.jpg"
    },
    {
      name: "Career",
      url: "/career",
      description: "A collection of my career experiences.",
      icon: < FontAwesomeIcon icon = {
        ['fas', 'briefcase']
      }
      />,
      image: "/static/images/career.jpg"
    },
    {
      name: "More",
      url: "/more",
      description: "A bit more content for the web-based world!",
      icon: <span role = "img" aria-label = "hmm">🤷</span>,
      image: "/static/images/more.jpg"
    }
  ]

  const siteMapButtons = [];
  siteMap.forEach(function (item, index) {
    siteMapButtons.push( 
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
            m: 4,
           }} endIcon={item.icon}>
            <Typography variant="h4">{item.name}</Typography>
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
      {siteMapButtons}
      </Stack>
  );
}
