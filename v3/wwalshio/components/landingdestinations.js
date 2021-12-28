/**React component for personal website landing page destinations section. */
/** Each destination is a link to a page on the website. */

/** Imports  */
import React from "react";
import Image from 'next/image';
import styles from "./landingdestinations";
import { styled } from '@mui/material/styles';
import NextLink from 'next/link';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faDumpsterFire} from '@fortawesome/free-solid-svg-icons';
import Direction from '../public/images/direction.svg';
import Projects from "../public/images/projects.svg";
import { Typography } from "@material-ui/core";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Icon from '@material-ui/core/Icon';
import { makeStyles } from '@material-ui/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import "bootstrap-icons/font/bootstrap-icons.css";
import { Fade } from '@mui/material';

export default function LandingDestinations() {
  const siteMap = [{ 
      name: "Interests",
      url: "/interests",
      description: "A collection of my interests and hobbies.",
      icon: <i class="bi bi-signpost-2" style={{p:0,m:0}}></i>,
      image: "/static/images/interests.jpg"
    },
    {
      name: "Projects",
      url: "/projects",
      description: "A collection of my projects.",
      icon: <i class="bi bi-kanban" style={{p:0,m:0}}></i>,
      image: "/static/images/projects.jpg"
    },
    {
      name: "Career",
      url: "/career",
      description: "A collection of my career experiences.",
      icon: <i class="bi bi-person-badge"></i>,
      image: "/static/images/career.jpg"
    },
    {
      name: "More",
      url: "/more",
      description: "A bit more content for the web-based world!",
      icon: <i class="bi bi-minecart-loaded"></i>,
      image: "/static/images/more.jpg"
    }
  ];

  const siteMapButtons = [];
  siteMap.forEach(function (item, index) {
    siteMapButtons.push(
      <NextLink href={item.url} passHref>
        <Grid item xs={2}>
          <Button variant="outlined" endIcon={item.icon} sx={{
            color: "theme.palette.text.primary",
            p: 2,
            fontSize: "1.5rem",
              backgroundColor: "rgb(92,107,192, 0.65)",
              '&:hover': {
                backgroundColor: "rgb(92,107,192, 0.8)",
                color: "#ffffff",
            }}}>
            {item.name}
          </Button>
        </Grid>
      </NextLink>
    )
  });

  return (
      <Grid container spacing={1}
      minWidth="sm"
      direction={{xs: "column", sm: "row"}}
      alignItems="center"
      justifyContent="center">
        {siteMapButtons}
      </Grid>
  );
}
