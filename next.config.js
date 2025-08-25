/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['your-domain.com', 'r2.cloudflarestorage.com', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Compress responses
  compress: true,
};

module.exports = nextConfig;