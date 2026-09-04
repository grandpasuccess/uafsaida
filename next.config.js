// UAFSAIDA — Next.js Configuration with Sentry & Vercel Analytics
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@anthropic-ai/sdk'],
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
  sentry: {
    hideSourceMaps: true,
    tunnelRoute: '/monitoring',
  },
};

const sentryWebpackPluginOptions = {
  org: 'uafsaida',
  project: 'uafsaida',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
