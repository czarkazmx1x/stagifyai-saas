import { PutObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || 
    `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

export async function uploadFile(file: File, key: string): Promise<UploadResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'stagifyai-storage',
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
    });

    await s3Client.send(command);
    
    // Return the URL - in production, this should be your custom domain
    const url = `${process.env.R2_PUBLIC_URL || 'https://your-domain.com/r2'}/${key}`;
    
    return {
      url,
      key,
      size: file.size,
    };
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    throw new Error('Failed to upload file');
  }
}

export async function getFileUrl(key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'stagifyai-storage',
      Key: key,
    });

    const response = await s3Client.send(command);
    
    // For now, return a placeholder URL
    // In production, you'd handle the actual file stream
    return `${process.env.R2_PUBLIC_URL || 'https://your-domain.com/r2'}/${key}`;
  } catch (error) {
    console.error('Error getting file from R2:', error);
    throw new Error('Failed to get file');
  }
}

export function generateFileKey(prefix: string, fileName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = fileName.split('.').pop();
  
  return `${prefix}/${timestamp}-${randomString}.${extension}`;
}

export function getPublicUrl(key: string): string {
  return `${process.env.R2_PUBLIC_URL || 'https://your-domain.com/r2'}/${key}`;
}