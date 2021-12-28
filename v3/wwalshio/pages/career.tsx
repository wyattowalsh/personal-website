import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import MyAppBar from '../components/appbar';
import Education from '../components/career/education/education';
import Experience from '../components/career/experience/experience';

export default function Career() {
    return (
        <Box>
            <MyAppBar /> 
            <Education />
            <Experience />
        </Box>
    );
}