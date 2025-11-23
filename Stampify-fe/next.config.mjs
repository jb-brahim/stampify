/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix workspace root warning
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
}

export default nextConfig
