# CCHMC Intelligent Space

A Next.js application for the Cincinnati Children's Hospital Medical Center (CCHMC) Pediatric Surgery intelligent space structure.

## Features

- **Intelligent Space Structure**: Medically accurate content organization
- **Content Viewing**: Support for videos, documents, and guidelines
- **S3 Integration**: Secure content delivery with signed URLs
- **Medical Categorization**: Content organized by medical specialties
- **Duplicate Prevention**: Clean content distribution across collections

## Pages

- `/intelligent-space` - Main intelligent space viewer
- `/cchmc-space-structured` - Structured space viewer
- `/s3-test` - S3 content testing

## API Endpoints

- `/api/intelligent-space-structure` - Intelligent structure data
- `/api/s3-content` - S3 content metadata
- `/api/space-content` - Space content data
- `/api/thumbnail` - Signed URL generation

## Environment Variables

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name
```

## Getting Started

```bash
npm install
npm run dev
```

## Deployment

This app is designed to be deployed to Vercel at `designer.ramyshaaban.org/designer/cchmc`.
