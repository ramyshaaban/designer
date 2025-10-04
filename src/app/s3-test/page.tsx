'use client';

import { S3ContentBrowser } from '@/components/S3ContentBrowser';

export default function S3TestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">S3 Content Integration Test</h1>
      <S3ContentBrowser />
    </div>
  );
}

