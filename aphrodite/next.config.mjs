/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  optimizeFonts: true,
  reactStrictMode: true,
};

export default nextConfig;
