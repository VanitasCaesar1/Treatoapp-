/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,

  // Standalone mode for Capacitor - includes Node.js server
  output: 'standalone',

  // Configuration for mobile app deployment
  images: {
    unoptimized: true, // Required for Capacitor
    domains: [], // Add any external image domains here
  },
};

module.exports = nextConfig;
