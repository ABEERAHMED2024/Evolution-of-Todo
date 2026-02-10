/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Disable telemetry in production
  experimental: {
    instrumentationHook: false
  }
};

module.exports = nextConfig;