'use client';

import { CCHMCSpaceViewer } from '@/components/CCHMCSpaceViewer';

export default function CCHMCSpacePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CCHMC Pediatric Surgery Space</h1>
        <p className="text-muted-foreground">
          Browse and interact with the CCHMC Pediatric Surgery content from S3 storage.
        </p>
      </div>
      <CCHMCSpaceViewer />
    </div>
  );
}

