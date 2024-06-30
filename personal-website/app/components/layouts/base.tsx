// layout.tsx

import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { ModalsProvider } from '@mantine/modals';
import type { Metadata } from 'next';
import React from 'react';
import { theme } from '../../../styles/themes/main';

export const metadata: Metadata = {
  title: "Wyatt Walsh's Personal Website",
  description: "Wyatt's links, blog posts, and projects",
}


export default function BaseLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        {children}
      </ModalsProvider>
    </MantineProvider>
  )
}
