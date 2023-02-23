/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, stream: false, os: false, path: false };

    return config;
  },
}

module.exports = nextConfig
