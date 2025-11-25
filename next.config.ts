/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,

  // Configuration for mobile app deployment
  images: {
    domains: [], // Add any external image domains here
  },
};

module.exports = nextConfig;
