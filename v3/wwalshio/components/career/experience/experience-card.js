/* React component JS file
This component renders a particular career experience item as a card given input JSON data.

Data schema for each experience item:
- label: string - the label for the experience item
- name: string - name of the organization
- location: string - location of the organization
- url: string - URL of the organization
- image: string - URL of the organization's logo
- role: string - role of the person in the organization
- tenure: {start: number, end: number} - start and end years of the role
- description: string - description of the role
- highlights: [string] - list of highlights for the role
- skills: [string] - list of skills utilized in the role

For each item in the input data, an item of the card is created. Furthermore, each of these items should have a label, including pre-label icon. Card actions should be used to link to the organization's website. 
*/
/* Imports */
// general
import * as React from 'react';
import NextLink from 'next/link';
// material-ui
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia'
import Button from '@mui/material/Button';
// custom
import styles from './experience-card.module.scss';
// Icons //
// fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
// material icons
import {   } from '@material-ui/icons';
// data
import data from './experiences.json';

/* Component */
export default function ExperienceCard({}) {
    
    return (
        <ul className={styles.list}>
            {data.experiences.map((item, index) => {
                return (
                    <li key={index}>
                        <Card sx={{ maxWidth: 345 }}>
                            <CardMedia
                                component="img"
                                height="30%"
                                src={item.image}
                                alt={item.name}
                            />
                            <CardContent>
                                <Typography variant="h5" color="text.secondary" sx={{textDecoration: "underline"}} gutterBottom>
                                    {item.label}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{}} gutterBottom>
                                    Name: <br/> {item.name}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{}} gutterBottom>
                                    Location: <br/> {item.location}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{}} gutterBottom>
                                    Role: <br/> {item.role}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{}} gutterBottom>
                                    Tenure: <br/> {item.tenure.start} &#8212; {item.tenure.end}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{}} gutterBottom>
                                    Description: <br/> {item.description}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{}} gutterBottom>
                                    Highlights: <br/> {item.highlights.join(", ")}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{}} gutterBottom>
                                    Skills: <br/> {item.skills.join(", ")}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" color="primary" href={item.url} target="_blank">
                                    <FontAwesomeIcon icon={faLink} />
                                    <span className={styles.buttonText}>
                                        {item.url}
                                    </span>
                                </Button>
                            </CardActions>
                        </Card>
                    </li>
                )
            })}
        </ul>
    )
};