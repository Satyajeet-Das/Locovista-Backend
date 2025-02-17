import { S3Client } from '@aws-sdk/client-s3';

const REGION = 'ap-southeast-1';

// Create an S3 client instance
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '', // Set in your environment variables
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '' // Set in your environment variables
  }
});

export default s3;
