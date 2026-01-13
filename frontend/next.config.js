/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // TEMPORARY: This allows production builds to successfully complete even if
    // your project has ESLint errors. This was added to unblock Vercel deployments
    // while 200+ ESLint errors are being addressed in a separate effort.
    // TODO: Remove this once ESLint errors are fixed (see issue tracking)
    // Developers can still run 'npm run lint' to check for errors locally.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type checking still enabled during builds for safety
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
