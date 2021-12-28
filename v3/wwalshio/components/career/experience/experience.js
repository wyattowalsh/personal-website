/* React component for experience section of career page */

/* Imports */
// general
import * as React from 'react';
// material-ui
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
// custom
import styles from './experience.module.scss';
import ExperienceCard from './experience-card';

/* Component */
export default function Experience() {

    return (
        // use Experience Card to render experience <section>
        <section className={styles.section}>
            <Container maxWidth="lg">
               <ExperienceCard />
            </Container>
        </section>

    )
};
