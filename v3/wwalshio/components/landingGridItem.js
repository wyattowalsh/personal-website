import * as React from 'react';
import NextLink from 'next/link';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

export default function LandingGridItem({
  numCols,
  item,
  pathname,
}) {

  return ( <
    Grid item xs = {
      numCols
    } >
    <
    NextLink href = {
      pathname
    }
    passHref > <
    Button key = {
      item
    }
    sx = {
      {
        '&:hover': {
          background: "secondary",
        }
      }
    } > < a > {
      item
    } < / a >  < /
    Button > <
    / NextLink>  < /
    Grid >
  );
}
