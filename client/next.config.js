/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        
      }
    ],
  }
};

module.exports = nextConfig;
