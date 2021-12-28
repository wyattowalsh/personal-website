import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia'
import Button from '@mui/material/Button';
import styles from './education.module.scss';
import NextLink from 'next/link';
import Hotchkiss from './hotchkiss';
import Berkeley from './berkeley';

export default function Education({}) {

    return (
        <ul className={styles.list}>
            <li><Hotchkiss/></li>
            <li><Berkeley/></li>
        </ul>
    )
};