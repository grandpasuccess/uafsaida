/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@anthropic-ai/sdk'],
  },
  eslint: {
    // Don't run eslint during build (we run it separately)
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
