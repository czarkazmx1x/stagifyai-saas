/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@prisma/client'],
  images: {
    domains: ['your-domain.com', 'r2.cloudflarestorage.com', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Compress responses
  compress: true,
  // Fix workspace root warning
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
