// app/components/ProjectCard.tsx

"use client";

import { faGithub, faKaggle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Button, Card, CardSection, Divider, Group, Image, Text, useMantineTheme } from '@mantine/core';
import React, { useState } from 'react';
import { IconContext } from "react-icons";
import { FaRegCalendarCheck } from "react-icons/fa6";
import styles from './ProjectCard.module.scss';

type ProjectCardProps = {
  title: string;
  description: string;
  date: string;
  url: string;
  urlIcon: string;
  image: string;
  tags: string[];
};

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, date, url, urlIcon, image, tags }) => {
  const theme = useMantineTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const parsedDate = new Date(date);
  const formattedDate = parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'github':
        return faGithub;
      case 'kaggle':
        return faKaggle;
      default:
        return null;
    }
  };

  const icon = getIcon(urlIcon);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder className={styles.card}>
      <CardSection>
        <div style={{ position: 'relative' }}>
          <Image src={image} height={200} alt={title} className={styles.media} />
          <Text className={styles.date} style={{ position: 'absolute', top: 0, right: 0 }}>
            <IconContext.Provider value={{ color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7], size: '1.2em', className: styles.dateIcon }}>
              <FaRegCalendarCheck className={styles.dateIcon} />
            </IconContext.Provider>
            {formattedDate}
          </Text>
        </div>
      </CardSection>
      <Divider my="sm" variant="dashed" />
      <div className={styles.content}>
        <Text className={styles.title} fw={800}>{title}</Text>
        <Divider my="sm" variant="dashed" />
        <Text size="sm" fw={500} className={styles.description}>
          {description.toString()}
        </Text>
        <Divider my="sm" variant="dashed" />
        <div className={styles.dateTagsContainer}>
          <Group className={`${styles.tags} ${isExpanded ? styles.expanded : ''}`}>
            {tags.map((tag, index) => (
              <Badge key={index} color="blue" variant="light">
                {tag}
              </Badge>
            ))}
          </Group>
          {tags.length > 5 && (
            <button className={styles.expandButton} onClick={handleExpand}>
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
        <Button
          variant="light"
          color="blue"
          fullWidth
          className={styles.button}
          leftSection={icon ? <FontAwesomeIcon icon={icon} className={styles.icon} size='lg' /> : null}
          rightSection={icon ? <FontAwesomeIcon icon={icon} className={styles.icon} size='lg' /> : null}
          component="a"
          href={url}
          target="_blank"
          autoContrast
        >
          View Project
        </Button>
      </div>
    </Card>
  );
};

export default ProjectCard;
