// layout.tsx

import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import React from 'react';
import { theme } from '../../../styles/themes/main';

export default function BaseLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MantineProvider theme={theme}>
        {children}
    </MantineProvider>
  )
}
