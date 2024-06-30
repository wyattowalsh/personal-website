// app/components/BackButton.tsx
"use client";

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@mantine/core';
import { useRouter } from 'next/navigation';

const BackButton: React.FC = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.push('/');
  };

  return (
    <Button onClick={handleBackClick} mb="xl" mt="xl" ml="xl" leftSection={<FontAwesomeIcon icon={faArrowLeft} />}>
      Back to Home Page
    </Button>
  );
};

export default BackButton;
