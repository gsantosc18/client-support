import React from 'react';
import { ClientEditPage } from '@/features/clients/pages/ClientEditPage';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditPage({ params }: PageProps) {
  return <ClientEditPage id={params.id} />;
}
