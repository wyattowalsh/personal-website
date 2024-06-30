// app/page.tsx
'use client'

import { Container, Stack, Title } from '@mantine/core';
import Image from 'next/image';
import styles from './Home.module.scss';
import { Socials } from './components/Socials';
import BaseLayout from './components/layouts/base';
import icon from './data/img/icon-nobg.webp';

export default function Home() {
    return (
      <BaseLayout>
        <main>
          <Stack justify="flex-start" align="center" ta="center" pt={8} mih="100vh" w="100vw" className={styles.container}>
            <Container pos='relative' className={styles.iconContainer}>
              <Image src={icon} alt="Site icon" quality={100} priority fill className={styles.avatar} />
            </Container>
            <Title order={1} className={styles.title}>Wyatt Walsh</Title>
            <Socials />
            <Title order={3} className={styles.subtitle}>Let&apos;s Connect 🤝</Title>
          </Stack>
        </main>
      </BaseLayout>
    );
}
