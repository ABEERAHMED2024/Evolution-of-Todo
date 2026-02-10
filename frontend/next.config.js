/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable telemetry in production
  experimental: {
    instrumentationHook: false
  }
};

module.exports = nextConfig;