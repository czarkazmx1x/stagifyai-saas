# Cloudflare Deployment Guide

## Overview

This guide will help you deploy your StagifyAI application on Cloudflare Pages with Workers, D1 database, and R2 storage.

## Prerequisites

1. Cloudflare account
2. Cloudflare CLI (`wrangler`) installed
3. Your application code ready
4. Google OAuth credentials configured

## Step 1: Database Migration to D1

### 1.1 Create D1 Database

```bash
# Install wrangler if not already installed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create stagifyai-db --region=auto
```

Note the `database_id` from the output.

### 1.2 Update Prisma Configuration

Create `wrangler.toml` in your project root:

```toml
name = "stagifyai"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "stagifyai-db"
database_id = "your-database-id-here"
```

Update your `.env` file:

```env
# Database
DATABASE_URL="file:./dev.db"
# For production, this will be handled by wrangler

# Cloudflare D1
CLOUDFLARE_D1_DATABASE_NAME="stagifyai-db"
CLOUDFLARE_D1_DATABASE_ID="your-database-id-here"
```

### 1.3 Update Prisma Schema for D1

`prisma/schema.prisma` is already compatible, but we need to update the client:

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["sqlite"]
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

## Step 2: File Storage Configuration

### 2.1 Create R2 Bucket

```bash
# Create R2 bucket
wrangler r2 bucket create stagifyai-storage
```

### 2.2 Configure Storage Handler

Create `src/lib/storage.ts`:

```typescript
import { PutObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFile(file: File, key: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(command);
  
  return `https://your-domain.com/r2/${key}`;
}

export async function getFileUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: key,
  });

  const response = await s3Client.send(command);
  return response.Body?.toString() || '';
}
```

## Step 3: Update Environment Variables

Create `.env.cloudflare`:

```env
# NextAuth.js
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-key
CLOUDFLARE_R2_BUCKET_NAME=stagifyai-storage
```

## Step 4: Update API Routes for Cloudflare

### 4.1 Update Staging API

Modify `src/app/api/stage/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { uploadFile } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const style = formData.get('style') as string;

    if (!file || !style) {
      return NextResponse.json(
        { error: 'Missing image or style parameter' },
        { status: 400 }
      );
    }

    // Upload original file to R2
    const originalKey = `originals/${Date.now()}-${file.name}`;
    const originalUrl = await uploadFile(file, originalKey);

    // Process with AI (existing code remains the same)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type;
    const imageDataUrl = `data:${mimeType};base64,${base64Image}`;

    const zai = await ZAI.create();
    
    const response = await zai.images.generations.create({
      prompt: `Virtual stage this empty room by adding furniture and decor. ${style} style. Make it look realistic and professional.`,
      image: imageDataUrl,
      size: "1024x1024"
    });

    const stagedImageBase64 = response.data[0].base64;
    
    // Convert base64 to file and upload to R2
    const stagedBuffer = Buffer.from(stagedImageBase64, 'base64');
    const stagedFile = new File([stagedBuffer], `staged-${Date.now()}.png`, {
      type: 'image/png'
    });
    
    const stagedKey = `staged/${Date.now()}-staged.png`;
    const stagedUrl = await uploadFile(stagedFile, stagedKey);

    return NextResponse.json({
      success: true,
      originalUrl,
      stagedUrl,
      style: style
    });

  } catch (error) {
    console.error('Staging error:', error);
    return NextResponse.json(
      { error: 'Failed to stage image. Please try again.' },
      { status: 500 }
    );
  }
}
```

## Step 5: Create Cloudflare Configuration

### 5.1 Create `wrangler.toml`

```toml
name = "stagifyai"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }

[env.staging]
vars = { ENVIRONMENT = "staging" }

[[d1_databases]]
binding = "DB"
database_name = "stagifyai-db"
database_id = "your-database-id-here"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "stagifyai-storage"

[build]
command = "npm run build"

[build.upload]
format = "modules"
dir = ".next"
main = "./server.js"
```

### 5.2 Create `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['your-domain.com', 'r2.cloudflarestorage.com'],
  },
};

module.exports = nextConfig;
```

## Step 6: Deployment

### 6.1 Build and Deploy

```bash
# Build the application
npm run build

# Deploy to Cloudflare
wrangler deploy

# Or for specific environment
wrangler deploy --env production
```

### 6.2 Set Up Custom Domain

1. In Cloudflare dashboard, add your custom domain
2. Configure DNS settings
3. Set up SSL/TLS
4. Update your Google OAuth redirect URIs to use the new domain

## Step 7: Post-Deployment Checks

### 7.1 Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to D1
wrangler d1 execute stagifyai-db --file=./prisma/migrations/0_init/migration.sql
```

### 7.2 Test All Features

- [ ] User registration and login
- [ ] Google OAuth authentication
- [ ] Image upload and staging
- [ ] File download
- [ ] Dashboard functionality
- [ ] All API endpoints

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure D1 database is properly configured
   - Check wrangler.toml bindings
   - Verify database ID is correct

2. **File Upload Failures**
   - Check R2 bucket permissions
   - Verify access keys are correct
   - Ensure bucket name matches configuration

3. **Authentication Issues**
   - Update NEXTAUTH_URL for production
   - Verify Google OAuth redirect URIs
   - Check environment variables

4. **Build Failures**
   - Ensure all dependencies are installed
   - Check Node.js version compatibility
   - Verify next.config.js settings

### Performance Optimization

1. **Enable Caching**
   ```javascript
   // In API routes
   export const revalidate = 3600; // 1 hour
   ```

2. **Use Edge Functions**
   ```javascript
   // For static content
   export const runtime = 'edge';
   ```

3. **Optimize Images**
   ```javascript
   // next.config.js
   images: {
     formats: ['image/webp', 'image/avif'],
   }
   ```

## Cost Considerations

- **D1 Database**: Free tier available (5GB storage, 25M daily reads)
- **R2 Storage**: Free tier available (10GB storage)
- **Workers**: Free tier available (100k requests/day)
- **Pages**: Free for static sites

## Security Best Practices

1. **Environment Variables**
   - Use Cloudflare secrets for sensitive data
   - Never commit secrets to version control

2. **CORS Configuration**
   - Set up proper CORS headers for your domain
   - Restrict access to your frontend

3. **Rate Limiting**
   - Implement rate limiting for API endpoints
   - Use Cloudflare's built-in DDoS protection

4. **SSL/TLS**
   - Enable full SSL mode
   - Use HSTS headers

## Monitoring and Analytics

1. **Cloudflare Analytics**
   - Monitor traffic and performance
   - Set up alerts for errors

2. **Logging**
   - Use Cloudflare Workers logging
   - Set up error tracking

3. **Health Checks**
   - Create health check endpoints
   - Monitor application uptime

This configuration provides a robust, scalable deployment on Cloudflare's edge network with optimal performance for your virtual staging SaaS application.