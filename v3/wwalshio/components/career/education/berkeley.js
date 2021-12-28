import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import NextLink from 'next/link';

const data = {
    "name": "The University of California, Berkeley",
    "location": "Berkeley, California",
    "url": "https://ieor.berkeley.edu/",
    "award": "Bachelor of Science",
    "major": "Industrial Engineering and Operations Research",
    "tenure": {
        "start": 2014,
        "end": 2020
    }
};

export default function Berkeley({}) {

    return (
        <Card sx={{ maxWidth: 345 }}>
        <CardMedia
            component="img"
            height="30%"
            src="./images/career/cal.svg"
            alt="Cal Berkeley"
        />
        <CardContent>
                    <Typography variant="h5" color="text.secondary" sx={{textDecoration: "underline"}} gutterBottom>
                    Undergraduate University
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{}} gutterBottom>
                    Name: <br/> {data.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{}} gutterBottom>
                    Location: <br/> {data.location}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{}} gutterBottom>
                    Award: <br/> {data.award}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{}} gutterBottom>
                    Major: <br/> {data.major}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{}} gutterBottom>
                    Tenure: <br/> {data.tenure.start} &#8212; {data.tenure.end}
                    </Typography>
        </CardContent>
        <CardActions>
            <NextLink href={data.url} passHref>
                <Button size="small" color="primary">Learn More</Button>
            </NextLink>
        </CardActions>
        </Card>
    )
};