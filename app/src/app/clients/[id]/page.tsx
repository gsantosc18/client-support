import React from 'react';
import { ClientDetailPage } from '@/features/clients/pages/ClientDetailPage';

interface PageProps {
  params: {
    id: string;
  };
}

export default function DetailPage({ params }: PageProps) {
  return <ClientDetailPage id={params.id} />;
}
