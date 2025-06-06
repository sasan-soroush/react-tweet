/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enable edge runtime for API routes
    runtime: "edge",
  },
};

module.exports = nextConfig;
