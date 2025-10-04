// AWS S3 Configuration
export const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  region: process.env.AWS_REGION || 'us-east-1',
  bucket: process.env.AWS_S3_BUCKET || 'staycurrent-app-prod',
};

export const s3Buckets = {
  production: 'staycurrent-app-prod',
  development: 'staycurrent-app-dev',
  gcmd: 'gcmd-production',
} as const;

