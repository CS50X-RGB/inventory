/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ disables eslint check during build
  },
 typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

